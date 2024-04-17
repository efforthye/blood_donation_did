// 실제 활용하는 메인 파일(중요)
// 암호화 및 복호화 테스트
// go run examples/cryptograph/ecdsa/main.go

package main

import (
	"crypto/sha256"
	"fmt"
	"ssikr/core"
)

func main() {
	fmt.Println("### Start Main() ###")

	// ECDSA secp256k1
	var ecdsa core.ECDSAManager // ecdsa := new(core.ECDSAManager)
	// 키를 생성해서 퍼블릭 키와 프라이빗 키를 가지고 있는 상태이다.
	ecdsa.Generate()

	// 출력해 보기
	fmt.Printf("########## Key pair ##########\n")
	fmt.Printf("===== Private Key =====\n")
	fmt.Printf("Private Key: %x\n", ecdsa.PrivateKey.D)
	fmt.Printf("===== Public Key(X, Y) =====\n")
	fmt.Printf("X=%s Y=%s\n", ecdsa.PublicKey.X, ecdsa.PublicKey.Y)
	fmt.Printf("  Hex: X=%x Y=%x\n\n", ecdsa.PublicKey.X.Bytes(), ecdsa.PublicKey.Y.Bytes())

	msg := "Hello World."
	digest := sha256.Sum256([]byte(msg))
	// 이미 ecdsa 안에 키가 있기 때문에 바로 다이제스트를 준다.
	signature, err := ecdsa.Sign(digest[:])
	if err != nil {
		fmt.Printf("Fail to sign to msg.")
	}

	fmt.Printf("########## Sign ##########\n")
	fmt.Printf("===== Message =====\n")
	fmt.Printf("Msg: %s\n", msg)
	fmt.Printf("Digest: %x\n", digest)
	fmt.Printf("R: %s, S: %s\n\n", signature.R, signature.S)

	ret := ecdsa.Verify(signature, digest[:])

	fmt.Printf("########## Verification ##########\n")
	if ret {
		fmt.Printf("Signature verifies\n")
	} else {
		fmt.Printf("Signature does not verify\n")
	}

	// ASN1
	signatureASN1, err := ecdsa.SignASN1(digest[:])
	if err != nil {
		fmt.Printf("Fail to sign to msg.")
	}

	fmt.Printf("\n\n########## SignASN1 ##########\n")
	fmt.Printf("===== Message =====\n")
	fmt.Printf("Msg: %s\n", msg)
	fmt.Printf("Digest: %x\n", digest)
	fmt.Printf("Signature: %x \n\n", signatureASN1)

	ret = ecdsa.VerifyASN1(signatureASN1, digest[:])

	fmt.Printf("########## Verification ASN1 ##########\n")
	if ret {
		fmt.Printf("SignatureASN1 verifies\n")
	} else {
		fmt.Printf("Signature does not verify\n")
	}
}
