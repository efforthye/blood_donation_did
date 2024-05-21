const crypto = require('crypto');
const { publicKey, privateKey } = require('./ecdsa.js');

/**
 * 헌혈 증서를 생성하고 서명
 * @param {string} donorId - 헌혈자 ID
 * @param {string} certificateId - 증서 ID
 * @param {number} donationDate - 헌혈 날짜
 * @returns {object} - 서명된 헌혈 증서
 */
function createDonationCertificate(donorId, certificateId, donationDate) {
  const certificate = {
    donorId,
    certificateId,
    donationDate,
    issuer: publicKey.export({ type: 'spki', format: 'pem' })
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
