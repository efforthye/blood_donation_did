package main

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/sha256"
	"fmt"
	"log"
	"math/big"
)

type Signature struct {
	R *big.Int
	S *big.Int
}

func (s Signature) String() string {
	return s.R.String() + s.S.String()
}

func sign(digest []byte, pvKey *ecdsa.PrivateKey) (*Signature, error) {
	r := big.NewInt(0)
	s := big.NewInt(0)

	r, s, err := ecdsa.Sign(rand.Reader, pvKey, digest)
	if err != nil {
		return nil, err //errors.New("failed to sign to msg.")
	}

	// prepare a signature structure to marshal into json
	signature := &Signature{
		R: r,
		S: s,
	}
	/*
		signature := r.Bytes()
		signature = append(signature, s.Bytes()...)
	*/
	return signature, nil
}

func SignASN1(digest []byte, pvKey *ecdsa.PrivateKey) ([]byte, error) {

	signature, err := ecdsa.SignASN1(rand.Reader, pvKey, digest)
	if err != nil {
		return nil, err //errors.New("failed to sign to msg.")
	}

	return signature, nil
}

func SignToString(digest []byte, pvKey *ecdsa.PrivateKey) (string, error) {
	signature, err := sign(digest, pvKey)
	if err != nil {
		return "", err
	}

	return signature.String(), nil
}

func verify(signature *Signature, digest []byte, pbKey *ecdsa.PublicKey) bool {
	return ecdsa.Verify(pbKey, digest, signature.R, signature.S)
}

func verifyASN1(signature []byte, digest []byte, pbKey *ecdsa.PublicKey) bool {
	return ecdsa.VerifyASN1(pbKey, digest, signature)
}

func main() {
	// 프라이빗 키 생성
	pvKey, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader) // elliptic.p224, elliptic.P384(), elliptic.P521()

	if err != nil {
		log.Println("ECDSA Keypair generation was Fail!")
	}

	// 서명할 메시지 지정
	msg := "Hello SSI-KOREA."
	digest := sha256.Sum256([]byte(msg))
	// 서명한 값을 signature 받아옴
	signature, err := sign(digest[:], pvKey)
	if err != nil {
		log.Printf("Failed to sign msg.")
	}

	fmt.Printf("########## Sign ##########\n")
	fmt.Printf("===== Message =====\n")
	fmt.Printf("Msg: %s\n", msg)
	fmt.Printf("Digest: %x\n", digest)
	fmt.Printf("R: %s, S: %s\n", signature.R, signature.S)
	fmt.Printf("Signature: %+v\n", signature.String())

	// 프라이빗 키에서 퍼블릭 키를 가져옴
	pbKey := &pvKey.PublicKey

	// 검증 (digest: 정상적인 다이제스트)
	ret := verify(signature, digest[:], pbKey)

	// 검증이 제대로 되었는지 안 되었는지에 따라 다른 텍스트 출력
	fmt.Println("########## Verification ##########")
	if ret {
		fmt.Println("Signature verifies")
	} else {
		fmt.Println("Signature does not verify")
	}

	// ASN1으로 서명하고 검증하는 부분
	signatureASN1, err := SignASN1(digest[:], pvKey)
	if err != nil {
		log.Printf("Failed to sign msg.")
	}
	// 검증2
	ret = verifyASN1(signatureASN1, digest[:], pbKey)

	fmt.Println("########## Verification 2 ##########")
	if ret {
		fmt.Println("Signature verifies")
	} else {
		fmt.Println("Signature does not verify")
	}

	// 변경된 메시지에 대한 검증 (텍스트를 변경하고 검증하면 false가 나와야 하므로, false가 나오는지 확인하기.)
	msg2 := "Hi~, World."
	digest2 := sha256.Sum256([]byte(msg2))

	ret = verify(signature, digest2[:], pbKey)

	fmt.Println("\n########## Verification 3: Other message ##########")
	if ret {
		fmt.Printf("Signature verifies")
	} else {
		fmt.Printf("Signature does not verify")
	}

	// 전에 암호화한 키와 다른 키를 하나 더 만들어서 그 키로 검증했을 때 오류가 정상적으로 나는지 확인하기
	pvKey2, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader) // elliptic.p224, elliptic.P384(), elliptic.P521()
	pbKey2 := &pvKey2.PublicKey
	ret = verify(signature, digest[:], pbKey2)

	fmt.Println("\n########## Verification 4: Other key ##########")
	if ret {
		fmt.Printf("Signature verifies")
	} else {
		fmt.Printf("Signature does not verify")
	}

}

// ########## Sign ##########
// ===== Message =====
// Msg: Hello SSI-KOREA.
// Digest: 4cc2b6b47522042263b8af953e3b766117a5095c376103b6a0db345ea47a27b3
// R: 81012234357276183664185639062091670646663833357584321969805731108191719712350, S: 23802675006467942626125067173970597965080584864810969044122921550631637005283
// Signature: 8101223435727618366418563906209167064666383335758432196980573110819171971235023802675006467942626125067173970597965080584864810969044122921550631637005283
// ########## Verification ##########
// Signature verifies
// ########## Verification 2 ##########
// Signature verifies

// ########## Verification 3: Other message ##########
// Signature does not verify
// ########## Verification 4: Other key ##########
// Signature does not verify%
