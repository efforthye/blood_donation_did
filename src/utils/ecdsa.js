import { generateKeyPair } from 'crypto';

// ecdsa 키 쌍 생성
const generateECDSAKeyPair = async () => {
    try {
        return new Promise((resolve, reject) => {
            generateKeyPair('ec', {
                namedCurve: 'prime256v1', // secp384r1, secp521r1을 사용하려면 여기를 변경하세요
                publicKeyEncoding: {
                    type: 'spki',
                    format: 'der'
                },
                privateKeyEncoding: {
                    type: 'pkcs8',
                    format: 'der'
                }
            }, (err, publicKey, privateKey) => {
                if (err) {
                    console.error('ECDSA Keypair generation failed:', err);
                    reject(err);
                } else {
                    const publicKeyString = publicKey.toString('hex');
                    const privateKeyString = privateKey.toString('hex');
                    resolve({ publicKey, privateKey, publicKeyString, privateKeyString });
                }
            });
        });
    } catch (error) {
        console.log({error});
        throw error;
    }
};

// 테스트
(async () => {
    try {
        // const { publicKey, privateKey, publicKeyString, privateKeyString } = await generateECDSAKeyPair();
        // console.log({ publicKey, privateKey, publicKeyString, privateKeyString });
    } catch (error) {
        console.error('Error:', error);
    }
})();


class Signature {
    constructor(r, s) {
        this.r = r;
        this.s = s;
    }

    toString() {
        return this.r.toString(16) + this.s.toString(16);
    }
}

const sign = (digest, pvKey) => {
  const signObj = crypto.createSign('SHA256');
  signObj.update(digest);
  signObj.end();
  const sig = signObj.sign({
    key: pvKey,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING
  });
  const derSig = crypto.SignatureObject.from(sig, 'der');
  return new Signature(derSig.r, derSig.s);
};

const signASN1 = (digest, pvKey) => {
  const signObj = crypto.createSign('SHA256');
  signObj.update(digest);
  signObj.end();
  return signObj.sign(pvKey, 'hex');
};

const signToString = async (digest, pvKey) => {
  try {
    const signature = await sign(digest, pvKey);
    return signature.toString();
  } catch (err) {
    console.error('Error signing data:', err);
    return '';
  }
};

const main = async () => {
  const { privateKey: pvKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'der'
    }
  });
  
  const msg = "Hello World.";
  const digest = crypto.createHash('sha256').update(msg).digest();
  
  try {
    const signature = await sign(digest, pvKey);
    const signatureASN1 = await signASN1(digest, pvKey);
    console.log("########## Sign ##########");
    console.log("===== Message =====");
    console.log(`Msg: ${msg}`);
    console.log(`Digest: ${digest.toString('hex')}`);
    console.log(`R: ${signature.r}, S: ${signature.s}`);
    console.log(`Signature: ${signature.toString()}`);
    console.log(`SignatureASN1: ${signatureASN1}`);
  } catch (err) {
    console.error("Failed to sign message:", err);
  }
};
  


export {
    generateECDSAKeyPair
}