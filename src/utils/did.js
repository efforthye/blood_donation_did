const crypto = require('crypto');

/**
 * 공개 키를 사용하여 DID의 해시를 생성
 * @param {string} pbKey - 공개 키
 * @returns {string} - 해시 값 (Base64 형식, 길이 44)
 */
function createDIDHash(pbKey) {
  return crypto.createHash('sha256').update(pbKey).digest('base64').substring(0, 44);
}

/**
 * DID를 생성
 * @param {string} method - DID 메서드 (예: 'polygon')
 * @param {string} pbKey - 공개 키
 * @returns {string} - DID 문자열
 */
function createDID(method, pbKey) {
  if (!method || !pbKey) {
    throw new Error('parameter is not valid');
  }
  const specificIdentifier = createDIDHash(pbKey);
  return `did:${method}:${specificIdentifier}`;
}

/**
 * DID 객체를 문자열로 변환
 * @param {object} did - DID 객체
 * @returns {string} - DID 문자열
 */
function didToString(did) {
  return String(did);
}

module.exports = {
  createDID,
  didToString
};
