const crypto = require('crypto');
const { publicKey, privateKey } = require('./ecdsa.js');

/**
 * 헌혈 증서를 생성하고 서명
 * @param {object} donor - 헌혈자 정보 (name, birth, bloodType)
 * @param {string} certificateId - 증서 ID
 * @param {string} donationDate - 헌혈 날짜
 * @param {string} donationNumber - 헌혈증 일련번호
 * @param {string} donationCenter - 헌혈한 센터
 * @returns {object} - 서명된 헌혈 증서
 */
function createDonationCertificate(donor, certificateId, donationDate, donationNumber, donationCenter) {
  const certificate = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential', 'BloodDonationCredential'],
    issuer: 'National Health Service',
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: `DID:${Date.now()}:${certificateId}`,
      name: donor.name,
      birth: donor.birth,
      bloodType: donor.bloodType,
      donationDate,
      donationNumber,
      donationCenter,
      certificateId
    },
    issuerPublicKey: publicKey.export({ type: 'spki', format: 'pem' })
  };

  const sign = crypto.createSign('SHA256');
  sign.update(JSON.stringify(certificate));
  sign.end();
  const signature = sign.sign(privateKey, 'base64');

  return { certificate, signature };
}

module.exports = {
  createDonationCertificate
};
