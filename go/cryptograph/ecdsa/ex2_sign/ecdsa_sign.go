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

	// 가장 중요한 부분
	r, s, err := ecdsa.Sign(rand.Reader, pvKey, digest)

	if err != nil {
		return nil, err //errors.New("failed to signto msg.")
	}
	// prepare a signature structure to marshal into json
	signature := &Signature{
		R: r,
		S: s,
	} /*
	   signature = append(signature, s.Bytes()...)
	*/
	return signature, nil
}

// 서명 국제 표기법
func SignASN1(digest []byte, pvKey *ecdsa.PrivateKey) ([]byte, error) {
	// vc, vp를 주고받을 때 하나의 문자열을 사용할 것이기 때문에 이것을 사용할 예정.
	signature, err := ecdsa.SignASN1(rand.Reader, pvKey, digest)
	if err != nil {
		return nil, err //errors.New("failed to signto msg.")
	}
	return signature, nil
}

// 위 함수로 만든 서명을 string으로 변환
func SignToString(digest []byte, pvKey *ecdsa.PrivateKey) (string, error) {
	signature, err := sign(digest, pvKey)
	if err != nil {
		return "", err
	}
	return signature.String(), nil
}
func main() {
	pvKey, err := ecdsa.GenerateKey(elliptic.P256(),
		rand.Reader)
	if err != nil {
		log.Println("ECDSA Keypair generation was Fail!")
	}
	// 암호화 할 문장 지정
	msg := "Hello World."
	digest := sha256.Sum256([]byte(msg))
	// [:] : 전부 다 넣어 주겠다는 뜻
	signature, err := sign(digest[:], pvKey)
	if err != nil {
		log.Printf("Failed to sign msg.")
	}
	signatureASN1, err := SignASN1(digest[:], pvKey)
	if err != nil {
		log.Printf("Failed to sign msg.")
	}
	fmt.Printf("########## Sign ##########\n")
	fmt.Printf("===== Message =====\n")
	fmt.Printf("Msg: %s\n", msg)
	fmt.Printf("Digest: %x\n", digest)
	fmt.Printf("R: %s, S: %s\n", signature.R, signature.S)
	fmt.Printf("Signature: %+v\n", signature.String())
	fmt.Printf("SignatureASN1: %+v\n", signatureASN1)
}
