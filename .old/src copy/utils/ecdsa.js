import { generateKeyPair } from 'crypto';

/**
 * # ecdsa 암호화 및 복호화
 * - ecdsa 키페어 생성: generateECDSAKeyPair()
 * - ecdsa 프라이빗 키를 통한 서명: sign(데이터, 프라이빗키)
 * 
 */
const generateECDSAKeyPair = async () => {
    try {
        return new Promise((resolve, reject) => {
            generateKeyPair('ec', {
                namedCurve: 'prime256v1', // secp384r1, secp521r1
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

// test
(async () => {
    try {
        // const { publicKey, privateKey, publicKeyString, privateKeyString } = await generateECDSAKeyPair();
        // console.log({ publicKey, privateKey, publicKeyString, privateKeyString });
    } catch (error) {
        console.error('Error:', error);
    }
})();


/**
 * # sign
 */
class Signature {
    constructor(r, s) {
        this.R = r;
        this.S = s;
    }

    toString() {
        return this.R.toString(16) + this.S.toString(16);
    }
}

function sign(digest, privateKey) {
    const signObj = crypto.createSign('SHA256');
    signObj.update(digest);
    const signatureDer = signObj.sign({
        key: privateKey,
        dsaEncoding: 'ieee-p1363'
    });
    const r = signatureDer.slice(0, 32); // Assuming P-256 curve
    const s = signatureDer.slice(32, 64);
    return new Signature(r.toString('hex'), s.toString('hex'));
}

function signASN1(digest, privateKey) {
    const signObj = crypto.createSign('SHA256');
    signObj.update(digest);
    return signObj.sign(privateKey, 'base64'); // Returning in base64 for easier visualization
}

function signToString(digest, privateKey) {
    const signature = sign(digest, privateKey);
    return signature.r.toString('hex') + signature.s.toString('hex');
}

export {
    generateECDSAKeyPair
}
