// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract BloodDonation {
    // 헌혈자
    struct Donor {
        string name;       // 이름
        uint age;          // 나이
        string bloodType;  // 혈액형
        string donorId;    // 헌혈자 고유 ID
    }

    // 헌혈증
    struct DonationCertificate {
        string certificateId;   // 증서 ID
        string donorId;         // 헌혈자 고유 ID
        uint256 donationDate;   // 헌혈 날짜
        bool isValid;           // 증서의 유효성
    }

    // 발행자
    address public redCross; // 발행자(대한적십자회의) 지갑 주소
    mapping(string => Donor) public donors; // 헌혈자 고유 ID에 따라 헌혈자 정보 매핑
    mapping(string => DonationCertificate) public certificates; // 헌혈증 ID에 따라 헌혈 증서 매핑

    constructor() {
        redCross = msg.sender; // 계약을 배포한 주소를 발행자인 대한적십자회 주소로 설정
    }

    // 주요 함수 호출을 발행자(대한적십자사)로 제한
    modifier onlyRedCross() {
        require(msg.sender == redCross, "Unauthorized: caller is not the Red Cross");
        _;
    }

    // 새 헌혈자 등록 함수
    function registerDonor(string memory _donorId, string memory _name, uint _age, string memory _bloodType) public onlyRedCross {
        Donor memory newDonor = Donor({
            name: _name,
            age: _age,
            bloodType: _bloodType,
            donorId: _donorId
        });
        donors[_donorId] = newDonor;
    }

    // 새 헌혈 증서 발급 함수
    function issueCertificate(string memory _donorId, string memory _certificateId, uint256 _donationDate) public onlyRedCross {
        require(donors[_donorId].age != 0, "Donor not registered");

        DonationCertificate memory newCertificate = DonationCertificate({
            certificateId: _certificateId,
            donorId: _donorId,
            donationDate: _donationDate,
            isValid: true
        });
        certificates[_certificateId] = newCertificate;
    }

    // 헌혈 증서 유효성 검증 함수
    function verifyCertificate(string memory _certificateId) public view returns (bool) {
        return certificates[_certificateId].isValid && donors[certificates[_certificateId].donorId].age != 0;
    }

    // 사용된 헌혈 증서를 무효화하는 함수
    function invalidateCertificate(string memory _certificateId) public onlyRedCross {
        require(certificates[_certificateId].isValid, "Certificate already invalidated");
        certificates[_certificateId].isValid = false;
    }

    // 헌혈 증서를 사용하는 함수
    function useCertificate(string memory _certificateId) public returns (string memory) {
        require(certificates[_certificateId].isValid, "Invalid certificate");
        // 증서 검증
        bool isValid = verifyCertificate(_certificateId);
        require(isValid, "Verification failed: invalid certificate");
        
        // 증서 사용 로직, 예를 들어 의료 서비스 제공 등
        // 예시: "Received medical service"
        
        // 증서 사용 후 무효화
        invalidateCertificate(_certificateId);
        
        return "Certificate used successfully, service provided.";
    }
}
