import crypto from 'crypto';

function createDIDHash(pbKey) {
  return crypto.createHash('sha256').update(pbKey).digest('base64').substring(0, 44);
}

function createDID(method, pbKey) {
  if (!method || !pbKey) {
    throw new Error('parameter is not valid');
  }
  const specificIdentifier = createDIDHash(pbKey);
  return `did:${method}:${specificIdentifier}`;
}

function didToString(did) {
  return String(did);
}

export { createDID, didToString };
