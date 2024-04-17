// go run examples/vc/jwt/main.go
package main

import (
	"fmt"
	"os"
	"ssikr/core"
)

// Issuer에 의한 VC 발행 예시.
func main() {
	// 키생성(ECDSA) - 향후 KMS로 대체.
	issuerKeyEcdsa := core.NewEcdsa()

	// DID 생성.
	issuerDid, _ := core.NewDID("comnic", issuerKeyEcdsa.PublicKeyBase58())

	// DID Document 생성.
	verificationId := fmt.Sprintf("%s#keys-1", issuerDid)
	verificationMethod := []core.VerificationMethod{
		{
			Id:                 verificationId,
			Type:               "EcdsaSecp256k1VerificationKey2019",
			Controller:         issuerDid.String(),
			PublicKeyMultibase: issuerKeyEcdsa.PublicKeyMultibase(),
		},
	}
	didDocument := core.NewDIDDocument(issuerDid.String(), verificationMethod)
	core.RegisterDid(issuerDid.String(), didDocument.String())

	// VC 생성.
	vc, err := core.NewVC(
		"1234567890",
		[]string{"VerifiableCredential", "AlumniCredential"},
		issuerDid.String(),
		map[string]interface{}{
			"id": "1234567890",
			"alumniOf": map[string]interface{}{
				"id": "1234567",
				"name": []map[string]string{
					{
						"value": "Example University",
						"lang":  "en",
					}, {
						"value": "Exemple d'Université",
						"lang":  "fr",
					},
				},
			},
		},
	)

	if err != nil {
		fmt.Println("Failed creation VC.")
		os.Exit(0)
	}

	// VC에 Issuer의 private key로 서명한다.(JWT 사용)
	// GenerateJWT 내부에 프라이빗키로 검증하는게 포함되어있다.
	token, err := vc.GenerateJWT(verificationId, issuerKeyEcdsa.PrivateKey)

	// 생성된 VC를 검증한다.(public key를 사용해서 검증)
	res, _ := vc.VerifyJwt(token, issuerKeyEcdsa.PublicKey)

	if res {
		fmt.Println("VC is verified.")
	} else {
		fmt.Println("VC is Not verified.")
	}

	// 토큰을 가지고 실제 VC 검증을 한다. 유효한지 확인한 값을 출력한다.
	isVerify, claims, err := core.ParseAndVerifyJwtForVC(token)
	if isVerify {
		fmt.Println("VC is verified.")
		fmt.Printf("Claims: %x\n", claims)
	} else {
		fmt.Println("VC is Not verified.")
	}

}
