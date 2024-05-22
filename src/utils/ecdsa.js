const { generateKeyPair, createSign, createVerify } = require('crypto');

// ECDSA 키 페어 생성 함수
const generateECDSAKeyPair = async () => {
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
};

/**
 * 서명 클래스
 */
class Signature {
    constructor(r, s) {
        this.R = r;
        this.S = s;
    }

    toString() {
        return this.R + this.S;
    }
}

/**
 * 데이터 서명 함수 (der 형식)
 * @param {Buffer} digest
 * @param {Buffer} privateKey
 * @returns {Signature}
 */
function sign(digest, privateKey) {
    try {
        const signObj = createSign('SHA256');
        signObj.update(digest);
        signObj.end();

        const signatureDer = signObj.sign({
            key: privateKey,
            format: 'der',
            type: 'pkcs8'
        });
        const r = signatureDer.slice(0, 32); // Assuming P-256 curve
        const s = signatureDer.slice(32, 64);

        const sign = new Signature(r.toString('hex'), s.toString('hex'));
        return sign
    } catch (error) {
        console.log({func: 'ecdsa.js sign', error});
        throw error;
    }
}

/**
 * 데이터 서명 함수 (ASN.1 형식)
 * @param {Buffer} digest
 * @param {Buffer} privateKey
 * @returns {string} Base64 encoded signature
 */
function signASN1(digest, privateKey) {
    const signObj = createSign('SHA256');
    signObj.update(digest);
    signObj.end();
    return signObj.sign(privateKey, 'base64');
}

/**
 * 서명 결과를 문자열로 반환
 * @param {Buffer} digest
 * @param {Buffer} privateKey
 * @returns {string}
 */
function signToString(digest, privateKey) {
    try {
        const signature = sign(digest, privateKey);
        return signature.toString();
    } catch (error) {
        console.log({func: 'ecdsa.js signToString', error});
        throw error;
    }
}

/**
 * 서명 검증 함수
 * @param {Buffer} digest
 * @param {string} signature Base64 encoded signature
 * @param {Buffer} publicKey
 * @returns {boolean}
 */
function verifySignature(digest, signature, publicKey) {
    const verifyObj = createVerify('SHA256');
    verifyObj.update(digest);
    verifyObj.end();
    return verifyObj.verify(publicKey, Buffer.from(signature, 'base64'));
}

module.exports = {
    generateECDSAKeyPair,
    // publicKey,
    // privateKey,
    sign,
    signASN1,
    signToString,
    verifySignature
};
