# Blood Donation DID Project
- DID-based blood donation platform.
<br/><br/>

## 시나리오(Scenario)
### 사용자 정의
- Issuer(발급자) - 대한적십자사
    - 대한적십자회는 헌혈증을 발급하는 발행인입니다. 헌혈자의 정보와 헌혈 내역을 수집하여 블록체인 혹은 데이터베이스에 저장하고, 이를 기반으로 헌혈증을 발급합니다.
- Holder(보유자) - 헌혈자
    - 헌혈자는 헌혈증의 소유자로서, 헌혈 후 발급된 디지털 헌혈증을 모바일 지갑에 저장하거나 웹 기반 서비스를 통해 접근할 수 있습니다.
- Verifier(검증자) - 의료기관 혹은 혈액 수급 기관
    - 헌혈증의 검증자는 의료기관이나 혈액 수급 기관입니다. 헌혈자가 헌혈증을 제시하면, 해당 기관은 블록체인을 통해 헌혈자의 신원과 헌혈 내역을 검증할 수 있습니다.
### 헌혈증 발급 및 검증 시나리오
1. 헌혈자 신원 생성과 등록: 헌혈자(Holder)가 헌혈을 신청하면, 대한적십자회(Issuer)는 헌혈자의 신상 정보를 수집하고 헌혈자의 디지털 신원(DID, Document Identifier)를 생성합니다. 생성된 DID와 신상 정보는 블록체인 기반의 Verifiable Data Registry(VDR)에 안전하게 등록되어 데이터 무결성이 보장됩니다.
2. 헌혈 증서의 발급 및 등록: 헌혈자가 헌혈을 완료하면, 대한적십자회(Issuer)는 헌혈자의 헌혈 정보를 바탕으로 디지털 헌혈 증서(Verifiable Credential, VC)를 생성합니다. 이 헌혈 증서는 헌혈자의 DID와 연결되며, VDR에 기록됩니다. 이 과정을 통해 헌혈 증서의 정확성과 진위가 보장됩니다.
3. 헌혈 증서의 제시와 전달: 헌혈자(Holder)가 의료기관을 방문하거나 혈액 기부를 위해 자신의 헌혈 증서를 사용할 경우, 해당 헌혈 증서를 포함한 Verifiable Presentation(VP)을 생성하여 검증자(Verifier)인 의료기관에 제시합니다. 이 VP는 헌혈자의 DID와 필요한 헌혈 정보만을 포함하여 개인 정보 보호를 강화합니다.
4. 헌혈 정보의 검증: 의료기관(Verifier)은 제시된 헌혈 증서(VP)에 포함된 정보와 VDR에서 조회한 헌혈 내역을 비교 검증합니다. 정보가 일치할 경우, 헌혈 증서가 유효하다고 판단하여 헌혈자의 기부 또는 의료 서비스 이용을 승인합니다.
5. 헌혈 증서의 사용과 폐기: 검증자는 헌혈자에게 헌혈증의 검증 결과를 제공합니다. 기부 시에는 헌혈자의 DID와 연결된 헌혈증서를 사용하여 혈액 기부를 진행하고, 헌혈증서 사용 시에는 기존에 보유한 헌혈 증서를 폐기하고 그에 상응하는 서비스를 제공합니다. 이 과정은 블록체인에 기록되어 헌혈 증서의 사용 내역이 투명하게 관리됩니다.
<br/><br/>

## VC & VP
- VC(Verifiable Credential): VC는 디지털 환경에서 신뢰성 있는 주체에 의해 발급된, 검증 가능한 자격 증명이다.
- VP(Verifiable Presentation): VP는 하나 이상의 VC를 포함하며, VC를 요청하는 쪽에 제시된다.

### 헌혈증 DID 프로젝트에의 적용
유저가 병원에서 수혈이 필요한 환자에게 자신의 헌혈증을 사용할 것을 증명하기 위해, 병원의 요구에 따라 자신의 Blood Donation Certificate VC를 기반으로 VP를 생성하여 제시한다.
이 VP는 병원에서 유저의 신원 및 헌혈 기록을 검증할 수 있게 해주며, 병원은 이를 통해 유저가 헌혈을 한 사실을 확인하고 필요한 절차를 진행할 수 있다.
- VC 정의
    - NAME: Blood Donation Certificate
    - ISSUER: National Health Service (가상의 발급 기관 이름입니다)
    - TYPE: ["VerifiableCredential", "BloodDonationCredential"]
    - CLAIMS:
        - name: 박혜림 (유저의 이름)
        - birth: 2001-12-22 (유저의 생년월일)
        - bloodType: AB (유저의 혈액형)
        - donationDate: 2023-04-18 (헌혈 날짜)
        - donationNumber: 123456 (헌혈증 일련번호)
        - donationCenter: 헌혈의집건대역센터 (헌혈한 센터)
        - certificateID: DID:(timestamp):123456789abcdefghi (디지털 신원 증명의 고유 식별자)
- VP 정의
    - NAME: 'Blood Donation Certificate Presentation'
    - CONTEXT: '병원에서 수혈 환자에게 헌혈증 사용을 증명하기 위해 사용'
    - TYPE: ["VerifiablePresentation", "BloodDonationPresentation"]
    - VERIFIABLE CREDENTIAL: Blood Donation Certificate VC
    - HOLDER: DID:(timestamp):987654321hgfedcba (VC 소유자의 디지털 신원 증명 고유 식별자)

## 실행 방법
- 모듈 설치: 프로젝트 루트에서 `npm install`
- 프로젝트 루트에 `.env` 파일 생성
    - `PORT`: 서버 실행 포트 정의
    - `API_URI`: 알케이 폴리곤 메인넷 프로젝트 URI 정의
    - `PRIVATE_KEY`: 배포를 위한 코인이 있는 메타마스크 비밀키 정의
    - `POLYGON_SCAN_KEY`: 스마트 컨트랙트 검증을 위한 폴리곤 스캔 API Key 정의
- 프로젝트 실행: 프로젝트 루트에서 `npm run start`
<br/><br/>


## 스마트 컨트랙트 빌드 및 배포
- build: `npx truffle compile`
- deploy: `npx truffle migrate --network development`
- polygon mainnet deploy: `npx truffle migrate --network polygon_mainnet`
<br/><br/>


## Block Transaction Explorer
- network: polygon mainnet
- url: https://polygonscan.com/address/0xc884c1264e4a672203FFBcFa6D275512a5c64a0A
- verify: https://polygonscan.com/address/0xc884c1264e4a672203FFBcFa6D275512a5c64a0A#code
<br/><br/>
