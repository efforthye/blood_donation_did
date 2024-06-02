const crypto = require('crypto');
const { privateKey } = require('./ecdsa.js');

/**
 * 검증 요청(Verifiable Presentation)을 생성하고 서명
 * @param {object} certificate - 헌혈 증서
 * @param {string} certificateSignature - 증서 서명
 * @param {string} holderDID - 소유자의 DID
 * @returns {object} - 서명된 검증 요청
 */
function createPresentation(certificate, certificateSignature, holderDID) {
  const presentation = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiablePresentation', 'BloodDonationPresentation'],
    verifiableCredential: {
      ...certificate,
      proof: {
        type: 'Ed25519Signature2018',
        created: new Date().toISOString(),
        proofPurpose: 'assertionMethod',
        verificationMethod: 'https://example.com/keys/1',
        jws: certificateSignature
      }
    },
    holder: holderDID
  };

  const sign = crypto.createSign('SHA256');
  sign.update(JSON.stringify(presentation));
  sign.end();
  const vpSignature = sign.sign(privateKey, 'base64');

  return { presentation, vpSignature };
}

module.exports = {
  createPresentation
};
