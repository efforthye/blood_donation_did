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

// 스마트 컨트랙트 ABI 및 주소 - build/contracts/BloodDonationRegistry.json - abi
const contractJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '../../build/contracts/BloodDonationRegistry.json'), 'utf8'));
const contractABI = contractJSON?.abi;
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(contractABI, contractAddress);

// 이더리움 계정 주소
const account = process.env.ACCOUNT;
const privateKey = Buffer.from(process.env.PRIVATE_KEY.replace(/,/g, ''), 'hex'); // 프라이빗 키에서 쉼표 제거

const getDonationDate = () => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const donationDate = `${year}-${month}-${day}`;
    return donationDate;
  } catch (error) {
    console.log({ func: 'getDonationDate', error });
    throw error;
  }
};

// 숫자를 16진수로 변환하는 함수
const toHex = (number) => {
  return '0x' + number.toString(16);
};

// 헌혈자(보유자) DID 생성
router.post('/create/donor', async (req, res, next) => {
  const { name, age, bloodType } = req.body;

  try {
    // Generate key pair and sign data
    const { privateKey: donorPrivateKey, publicKey, publicKeyString, privateKeyString } = await generateECDSAKeyPair();
    const signedData = signToString(`Name: ${name}, Age: ${age}, Blood Type: ${bloodType}`, donorPrivateKey);

    const donationDate = getDonationDate();

    // Create DID
    const method = 'polygon';
    const did = createDID(method, publicKeyString);

    // Store data on the blockchain
    const registerDonation = contract.methods.recordDonation(did, donationDate, bloodType); // recordDonation 함수 호출
    const gasPrice = BigInt(await web3.eth.getGasPrice());
    console.log({ gasPrice });
    const gasEstimate = await registerDonation.estimateGas({ from: account });
    console.log({ gasEstimate });

    // EIP-1559 트랜잭션 데이터 준비
    const maxPriorityFeePerGas = toHex(gasPrice * BigInt(10)); // 현재 가스 가격의 10배
    const maxFeePerGas = toHex(gasPrice * BigInt(12)); // 현재 가스 가격의 6배

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

    // txData 유효성 검사
    if (!/^0x[0-9a-fA-F]+$/.test(txData.maxPriorityFeePerGas) ||
        !/^0x[0-9a-fA-F]+$/.test(txData.maxFeePerGas) ||
        !/^0x[0-9a-fA-F]+$/.test(txData.gasLimit)) {
        throw new Error('Invalid transaction data');
    }
    console.log({ txData });

    // 트랜잭션 객체 생성
    const common = Common.custom({
      name: 'matic',
      networkId: 137,
      chainId: 137,
    }, {
      baseChain: 'mainnet',
      hardfork: 'london' // EIP-1559를 사용하기 위해 'london' 하드포크를 사용
    });
    console.log({ common });

    const tx = FeeMarketEIP1559Transaction.fromTxData(txData, { common });
    console.log({ tx });

    // 트랜잭션 서명
    const signedTx = tx.sign(privateKey);
    const serializedTx = signedTx.serialize();
    const serializedTxHex = Buffer.from(serializedTx).toString('hex'); // 올바른 hex 형식으로 변환
    console.log('Serialized Transaction Hex:', serializedTxHex);

    // 서명된 트랜잭션 전송
    web3.eth.sendSignedTransaction('0x' + serializedTxHex)
      .on('receipt', (receipt) => {
        console.log('Transaction receipt:', receipt);
        res.send({ success: true, receipt, signedData, publicKey: publicKeyString, did });
      })
      .on('error', async (error) => {
        console.error('Transaction error:', error);
      });
  } catch (error) {
    next(error); // 에러를 다음 미들웨어로 전달
  }
});

router.post('/create/certificate', (req, res, next) => {
  const { donorId, certificateId, donationDate } = req.body;
  try {
    const { certificate, signature } = createDonationCertificate(donorId, certificateId, donationDate);
    res.send({ certificate, signature });
  } catch (error) {
    next(error); // 에러를 다음 미들웨어로 전달
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

router.post('/create/did', (req, res, next) => {
    try {
        const { name, age, bloodType } = req.body;
        
        // Generate key pair
        generateECDSAKeyPair().then(({ publicKeyString }) => {
            // Create DID
            const method = 'polygon';
            const did = createDID(method, publicKeyString);
            res.send({ name, age, bloodType, did });
        }).catch(next); // 에러를 다음 미들웨어로 전달
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
