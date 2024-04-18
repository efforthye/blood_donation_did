const router = require("express").Router();
const Web3 = require('web3');

// Web3 provider 설정
const web3 = new Web3(process.env.API_URI); 

// 스마트 컨트랙트 ABI 및 주소
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"certificates","outputs":[{"internalType":"string","name":"certificateId","type":"string"},{"internalType":"string","name":"donorId","type":"string"},{"internalType":"uint256","name":"donationDate","type":"uint256"},{"internalType":"bool","name":"isValid","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"donors","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"age","type":"uint256"},{"internalType":"string","name":"bloodType","type":"string"},{"internalType":"string","name":"donorId","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_certificateId","type":"string"}],"name":"invalidateCertificate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_donorId","type":"string"},{"internalType":"string","name":"_certificateId","type":"string"},{"internalType":"uint256","name":"_donationDate","type":"uint256"}],"name":"issueCertificate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"redCross","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_donorId","type":"string"},{"internalType":"string","name":"_name","type":"string"},{"internalType":"uint256","name":"_age","type":"uint256"},{"internalType":"string","name":"_bloodType","type":"string"}],"name":"registerDonor","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_certificateId","type":"string"}],"name":"useCertificate","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_certificateId","type":"string"}],"name":"verifyCertificate","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}];
const contractAddress = '0xc884c1264e4a672203FFBcFa6D275512a5c64a0A'; // 배포된 컨트랙트 주소
const contract = new web3.eth.Contract(contractABI, contractAddress);

// 이더리움 계정 주소 (여기서는 예시로 간단하게 작성)
const account = '0x3849a42F84AA95c8F90a336A2ff14D506aF95673';



// VC, VP 생성 및 VDR 입력

router.post('/create/did', (req, res) =>{
    try {
        const {name, age, bloodType} = req.body;
        
        // 해당 정보를 ecdsa 암호화 하여 블록체인에 저장
        // 스마트 컨트랙트의 새 헌혈자 등록 함수 사용: registerDonor()
        // 생성된 헌혈자의 고유 아이디 리턴

        res.send({name, age, bloodType});
    } catch (error) {
        console.log({error});
        res.send({error});
    }
});

// 헌혈자 고유 ID를 통하여 BloodDonation 컨트랙트에 헌혈 증서를 생성
// 스마트 컨트랙트의 새 헌혈 증서 발급 함수 사용: issueCertificate()
// 생성된 증서의 아이디, 증서의 유효 여부 리턴
router.post('/create/certificate', async (req, res) =>{
    try {
        const {donorId, name, age, bloodType, certificateId} = req.body;
        
        // 헌혈증 데이터 등록
        async function registerDonationCertificate(donorId, name, age, bloodType, certificateId, donationDate) {
            const registerDonor = contract.methods.registerDonor(donorId, name, age, bloodType);
            const issueCertificate = contract.methods.issueCertificate(donorId, certificateId, donationDate);
        
            // 헌혈자 등록 및 헌혈증 발행 트랜잭션 전송
            const gasPrice = await web3.eth.getGasPrice();
            const gasEstimate1 = await registerDonor.estimateGas({ from: account });
            const gasEstimate2 = await issueCertificate.estimateGas({ from: account });
        
            const registerTx = await registerDonor.send({ from: account, gas: gasEstimate1, gasPrice });
            const issueTx = await issueCertificate.send({ from: account, gas: gasEstimate2, gasPrice });
        
            return { registerTx, issueTx };
        }
        
        // const result = await registerDonationCertificate('DONOR1222', '박혜림', 24, 'AB+', 'CERT001', Date.now());
        const result = await registerDonationCertificate(donorId, name, age, bloodType, certificateId, Date.now());

        res.send({donorId, result});
    } catch (error) {
        console.log({error});
        res.send({error});
    }
});

router.post('/use/certificate', (req, res) =>{
    try {
        const {certificateId, donorId} = req.body;
        
        // 헌혈증 고유 ID를 통하여 BloodDonation 컨트랙트에서 헌혈 증서를 사용
        // 스마트 컨트랙트의 헌혈 증서를 사용하는 함수 사용: useCertificate()
        // 위 함수를 사용하면 내부적으로 verifyCertificate와 invalidateCertificate가 실행됨

        res.send({donorId});
    } catch (error) {
        console.log({error});
        res.send({error});
    }
});

module.exports = router;