const crypto = require('crypto');
const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'secp256k1'
});

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

const vc = createDonationCertificate('DONOR123', 'CERT001', Date.now());
console.log(vc);
