// go run examples/vc/simple/main.go
// eyJhbGciOiJFUzI1NiIsImtpZCI6ImRpZDpzc2lrcjo4dWJxZU1qaWNUUVZQdk0zVldvbjRHOW83dTV2V0tDZzd3QVlveTFVUHc3VCNrZXlzLTEiLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE3MTExNzI0MzMsImp0aSI6IjExMTIzNDIiLCJpYXQiOjE3MTExNzIxMzMsImlzcyI6ImRpZDpzc2lrcjo4dWJxZU1qaWNUUVZQdk0zVldvbjRHOW83dTV2V0tDZzd3QVlveTFVUHc3VCIsIm5iZiI6MTcxMTE3MjEzMywic3ViIjoiVmVyaWZpYWJsZSBDcmVkZW50aWFsIiwiTm9uY2UiOiJxd2FzZCEyMzQiLCJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSIsImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YyIl0sImlkIjoiMTIzNDU2Nzg5MCIsInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJBbHVtbmlDcmVkZW50aWFsIl0sImlzc3VlciI6ImRpZDpzc2lrcjo4dWJxZU1qaWNUUVZQdk0zVldvbjRHOW83dTV2V0tDZzd3QVlveTFVUHc3VCIsImlzc3VhbmNlRGF0ZSI6IjIwMjQtMDMtMjNUMTQ6MzU6MzMrMDk6MDAiLCJjcmVkZW50aWFsU3ViamVjdCI6eyJhbHVtbmlPZiI6eyJpZCI6IjEyMzQ1NjciLCJuYW1lIjpbeyJsYW5nIjoiZW4iLCJ2YWx1ZSI6IkV4YW1wbGUgVW5pdmVyc2l0eSJ9LHsibGFuZyI6ImZyIiwidmFsdWUiOiJFeGVtcGxlIGQnVW5pdmVyc2l0w6kifV19LCJpZCI6IjEyMzQ1Njc4OTAifX19.zzk3MAbIrnwcwsHxVpVS0Orc3kORxibE3vLidKVsrfFu1SePuTcrPfvCr7jhm1XVBUrv8YwpiVvp_q_CCVMIjg
package main

import (
	"fmt"
	"os"
	"ssikr/core"
)

// Issuer에 의한 VC 발행 예시.
func main() {
	// 키생성(ECDSA) - 향후 KMS로 대체.
	// 키 이름을 이슈어 키라고 하고 암호화 방식도 키이름으로 해줌.
	issuerKeyEcdsa := core.NewEcdsa()

	// 이슈어의 DID 생성. (퍼블릭키)
	issuerDid, _ := core.NewDID("ssikr", issuerKeyEcdsa.PublicKeyBase58())

	// DID Document 생성.
	verificationId := fmt.Sprintf("%s#keys-1", issuerDid)
	//verificationMethod := []core.VerificationMethod{
	//	{
	//		Id:                 verificationId,
	//		Type:               "EcdsaSecp256k1VerificationKey2019",
	//		Controller:         issuerDid.String(),
	//		PublicKeyMultibase: issuerKeyEcdsa.PublicKeyMultibase(),
	//	},
	//}
	//didDocument := core.NewDIDDocument(issuerDid.String(), verificationMethod)
	// DID와 DID Document를 VDR에 올려야 하나, 현재 생략.

	// 실제 VC 객체 생성. (매우 중요)
	vc, err := core.NewVC(
		"1234567890", // 아이디
		[]string{"VerifiableCredential", "AlumniCredential"}, // 목적과 이름
		issuerDid.String(), // 누가 발행했는지 발행자 DID
		map[string]interface{}{
			"id": "1234567890",
			"alumniOf": map[string]interface{}{
				"id": "1234567",
				"name": []map[string]string{
					{
						"value": "Example University", // 영어로는
						"lang":  "en",
					}, {
						"value": "Exemple d'Université", // 프랑스어로는
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
	// 프라이빗 키를 넣어야 서명을 해줄수 있어서 프라이빗 키를 넣어준다.
	token, err := vc.GenerateJWT(verificationId, issuerKeyEcdsa.PrivateKey)
	fmt.Println("")
	fmt.Println("")
	fmt.Println(token)
	fmt.Println("")
	fmt.Println("")

	// 생성된 VC를 검증한다.(public key를 사용해서 검증)
	// 검증은 퍼블릭 키로 한다.
	res, _ := vc.VerifyJwt(token, issuerKeyEcdsa.PublicKey)

	if res {
		fmt.Println("VC is verified.")
	} else {
		fmt.Println("VC is Not verified.")
	}

}
