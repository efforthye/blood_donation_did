const router = require("express").Router();

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

router.post('/create/certificate', (req, res) =>{
    try {
        const {donorId} = req.body;
        
        // 헌혈자 고유 ID를 통하여 BloodDonation 컨트랙트에 헌혈 증서를 생성
        // 스마트 컨트랙트의 새 헌혈 증서 발급 함수 사용: issueCertificate()
        // 생성된 증서의 아이디, 증서의 유효 여부 리턴

        res.send({donorId});
    } catch (error) {
        console.log({error});
        res.send({error});
    }
});

module.exports = router;