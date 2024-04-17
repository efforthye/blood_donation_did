// registrar, resolver 서버는 마찬가지로 켜져 있어야 한다.
package main

import (
	"fmt"
	"ssikr/core"
)

func main() {
	issuerKeyEcdsa := core.NewEcdsa()
	holderKeyEcdsa := core.NewEcdsa()

	// Issuer DID 생성.
	issuerDid, _ := core.NewDID("ssikr", issuerKeyEcdsa.PublicKeyBase58())

	// Issuer DID Document 생성.
	verificationId := fmt.Sprintf("%s#keys-1", issuerDid) // 앞의 DID값이 다르기 때문에 유일한 값이 될 것이다.
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
	fmt.Println("Issuer DID Document: ", didDocument)

	// Holder DID 생성.
	holderDid, _ := core.NewDID("ssikr", holderKeyEcdsa.PublicKeyBase58())

	// Holder DID Document 생성.
	verificationIdForHolder := fmt.Sprintf("%s#keys-1", holderDid)
	verificationMethodForHolder := []core.VerificationMethod{
		{
			Id:                 verificationIdForHolder,
			Type:               "EcdsaSecp256k1VerificationKey2019",
			Controller:         holderDid.String(),
			PublicKeyMultibase: holderKeyEcdsa.PublicKeyMultibase(),
		},
	}
	didDocumentForHolder := core.NewDIDDocument(holderDid.String(), verificationMethodForHolder)
	core.RegisterDid(holderDid.String(), didDocumentForHolder.String())

	// VC 생성. (이슈어가 발행하는 것처럼 되어야곘죠)
	vc1, _ := core.NewVC(
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

	vc2, _ := core.NewVC(
		"123456789012345",
		[]string{"VerifiableCredential", "CertificationOfEmployee"},
		issuerDid.String(),
		map[string]interface{}{
			"id":          "123456789012121212",
			"company":     "SSIKR Co.",
			"joiningDate": "2020.01.01",
			"name":        "Hong kil-dong",
			"birthDate":   "2000.01.01",
		},
	)
	vc1Token, _ := vc1.GenerateJWT(verificationId, issuerKeyEcdsa.PrivateKey)
	vc2Token, _ := vc2.GenerateJWT(verificationId, issuerKeyEcdsa.PrivateKey)
	vcs := []string{vc1Token, vc2Token} // 두개를 묶어서 하나로 만듦(?)

	vp, err := core.NewVP(
		"121212121", // 가짜 데이터
		[]string{"VerifiablePresentation", "TestPresentation"}, // 이름 맘대로 지음
		holderDid.String(), // VP를 만들때 꼭 홀더의 DID를 넣어야 한다.(중요)
		vcs,
	)

	if err != nil {
		panic(fmt.Sprintf("Error: ", err))
	}

	fmt.Println("VP: ", vp)

	// VP를 만드는 것은 홀더이기 때문에 서명도 홀더의 키로 서명을 하여야 한다.
	vpToken := vp.GenerateJWT(verificationIdForHolder, holderKeyEcdsa.PrivateKey)
	fmt.Println("VP Token: ", vpToken)
}
