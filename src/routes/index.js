const express = require('express');
const { Web3 } = require('web3');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { generateECDSAKeyPair, signToString } = require('../utils/ecdsa.js');
const { createDID } = require('../utils/did.js');
const { createDonationCertificate } = require('../utils/vc.js');
const { createPresentation } = require('../utils/vp.js');
const { FeeMarketEIP1559Transaction } = require('@ethereumjs/tx');
const { Common } = require('@ethereumjs/common');

dotenv.config();

const router = express.Router();

// Web3 provider 설정
const web3 = new Web3(process.env.API_URI);

// 스마트 컨트랙트 ABI 및 주소
const contractJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '../../build/contracts/BloodDonationRegistry.json'), 'utf8'));
const contractABI = contractJSON?.abi;
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(contractABI, contractAddress);

// 이더리움 계정 주소
const account = process.env.ACCOUNT;
const privateKey = Buffer.from(process.env.PRIVATE_KEY.replace(/,/g, ''), 'hex');

const getDonationDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toHex = (number) => {
  return '0x' + number.toString(16);
};

// BigInt를 처리하는 JSON.stringify replacer 함수
const jsonReplacer = (key, value) =>
  typeof value === 'bigint' ? value.toString() : value;

// 헌혈자(보유자) DID 생성
router.post('/create/donor', async (req, res, next) => {
  const { name, age, bloodType } = req.body;

  try {
    const { privateKey: donorPrivateKey, publicKey, publicKeyString, privateKeyString } = await generateECDSAKeyPair();
    const signedData = signToString(`Name: ${name}, Age: ${age}, Blood Type: ${bloodType}`, donorPrivateKey);

    const donationDate = getDonationDate();
    const method = 'polygon';
    const did = createDID(method, publicKeyString);

    const registerDonation = contract.methods.recordDonation(did, donationDate, bloodType);
    const gasPrice = BigInt(await web3.eth.getGasPrice());
    const gasEstimate = await registerDonation.estimateGas({ from: account });

    const maxPriorityFeePerGas = toHex(gasPrice * BigInt(20));
    const maxFeePerGas = toHex(gasPrice * BigInt(22));

    const nonce = await web3.eth.getTransactionCount(account, 'pending');
    const txData = {
      nonce: toHex(nonce),
      maxPriorityFeePerGas: maxPriorityFeePerGas,
      maxFeePerGas: maxFeePerGas,
      gasLimit: toHex(gasEstimate),
      to: contractAddress,
      data: registerDonation.encodeABI(),
      value: '0x00',
      chainId: 137
    };

    if (!/^0x[0-9a-fA-F]+$/.test(txData.maxPriorityFeePerGas) ||
        !/^0x[0-9a-fA-F]+$/.test(txData.maxFeePerGas) ||
        !/^0x[0-9a-fA-F]+$/.test(txData.gasLimit)) {
        throw new Error('Invalid transaction data');
    }

    const common = Common.custom({
      name: 'matic',
      networkId: 137,
      chainId: 137,
    }, {
      baseChain: 'mainnet',
      hardfork: 'london'
    });

    const tx = FeeMarketEIP1559Transaction.fromTxData(txData, { common });
    const signedTx = tx.sign(privateKey);
    const serializedTx = signedTx.serialize();
    const serializedTxHex = '0x'+Buffer.from(serializedTx).toString('hex');
    console.log({signedTx, serializedTxHex});

    web3.eth.sendSignedTransaction(serializedTxHex)
      .on('receipt', (receipt) => {
        res.send({ success: true, receipt: JSON.parse(JSON.stringify(receipt, jsonReplacer)), signedData, publicKey: publicKeyString, did });
      })
      .on('error', async (error) => {
        if (error.message.includes('Transaction was not mined within 50 blocks')) {
          const newNonce = await web3.eth.getTransactionCount(account, 'pending');
          const newTxData = { ...txData, nonce: toHex(newNonce) };
          const newTx = FeeMarketEIP1559Transaction.fromTxData(newTxData, { common });
          const newSignedTx = newTx.sign(privateKey);
          const newSerializedTx = newSignedTx.serialize();
          const newSerializedTxHex = Buffer.from(newSerializedTx).toString('hex');
          web3.eth.sendSignedTransaction('0x' + newSerializedTxHex)
            .on('receipt', (newReceipt) => {
              res.send({ success: true, receipt: JSON.parse(JSON.stringify(newReceipt, jsonReplacer)), signedData, publicKey: publicKeyString, did });
            })
            .on('error', (newError) => {
              console.error('Transaction error on retry:', newError);
              next(newError);
            });
        } else {
          console.error('Transaction error:', error);
          next(error);
        }
      });
  } catch (error) {
    next(error);
  }
});

router.post('/create/presentation', (req, res, next) => {
  const { certificate, signature } = req.body;
  try {
    const vp = createPresentation(certificate, signature);
    res.send(vp);
  } catch (error) {
    next(error); // 에러를 다음 미들웨어로 전달
  }
});

router.post('/use/certificate', (req, res, next) => {
    try {
        const { certificateId, donorId } = req.body;
        
        // 헌혈증 고유 ID를 통하여 BloodDonation 컨트랙트에서 헌혈 증서를 사용
        // 스마트 컨트랙트의 헌혈 증서를 사용하는 함수 사용: useCertificate()
        // 위 함수를 사용하면 내부적으로 verifyCertificate와 invalidateCertificate가 실행됨

        res.send({ donorId });
    } catch (error) {
        next(error); // 에러를 다음 미들웨어로 전달
    }
});

module.exports = router;
