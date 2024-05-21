const crypto = require('crypto');
const { privateKey } = require('./ecdsa.js');

/**
 * 검증 요청(Verifiable Presentation)을 생성하고 서명
 * @param {object} certificate - 헌혈 증서
 * @param {string} signature - 증서 서명
 * @returns {object} - 서명된 검증 요청
 */
function createPresentation(certificate, signature) {
  const presentation = {
    certificate,
    signature
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
