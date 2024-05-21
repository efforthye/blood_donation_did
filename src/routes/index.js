const express = require('express');
const { Web3 } = require('web3');
const dotenv = require('dotenv');
const { generateECDSAKeyPair, signToString } = require('../utils/ecdsa.js');
const { createDID } = require('../utils/did.js');
const { createDonationCertificate } = require('../utils/vc.js');
const { createPresentation } = require('../utils/vp.js');

dotenv.config();

const router = express.Router();

// Web3 provider 설정
const web3 = new Web3(process.env.API_URI);

// 스마트 컨트랙트 ABI 및 주소
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"certificates","outputs":[{"internalType":"string","name":"certificateId","type":"string"},{"internalType":"string","name":"donorId","type":"string"},{"internalType":"uint256","name":"donationDate","type":"uint256"},{"internalType":"bool","name":"isValid","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"donors","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"age","type":"uint256"},{"internalType":"string","name":"bloodType","type":"string"},{"internalType":"string","name":"donorId","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_certificateId","type":"string"}],"name":"invalidateCertificate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_donorId","type":"string"},{"internalType":"string","name":"_certificateId","type":"string"},{"internalType":"uint256","name":"_donationDate","type":"uint256"}],"name":"issueCertificate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"redCross","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_donorId","type":"string"},{"internalType":"string","name":"_name","type":"string"},{"internalType":"uint256","name":"_age","type":"uint256"},{"internalType":"string","name":"_bloodType","type":"string"}],"name":"registerDonor","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_certificateId","type":"string"}],"name":"useCertificate","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_certificateId","type":"string"}],"name":"verifyCertificate","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}];
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(contractABI, contractAddress);

// 이더리움 계정 주소
const account = '0x3849a42F84AA95c8F90a336A2ff14D506aF95673';

router.post('/create/donor', async (req, res, next) => {
    const { name, age, bloodType } = req.body;

    try {
        // Generate key pair and sign data
        const { privateKey, publicKey, publicKeyString, privateKeyString } = await generateECDSAKeyPair();
        const signedData = signToString(`Name: ${name}, Age: ${age}, Blood Type: ${bloodType}`, privateKey);

        // Create DID
        const method = 'polygon';
        const did = createDID(method, publicKeyString);

        // Store data on the blockchain
        const registerDonor = contract.methods.registerDonor(did, name, age, bloodType);
        const gasPrice = await web3.eth.getGasPrice();
        const gasEstimate = await registerDonor.estimateGas({ from: account });

        // Sending transaction
        const transaction = await registerDonor.send({ from: account, gas: gasEstimate, gasPrice });

        res.send({ success: true, transaction, signedData, publicKey: publicKeyString, did });
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
