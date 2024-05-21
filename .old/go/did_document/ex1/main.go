// examples/did_document/ex1/main.go

package main

import (
	"fmt"
	"log"
	"ssikr/core"
)

func main() {
	var method = "ssikr"

	// 1. 키생성(ECDSA)
	kms := new(core.ECDSAManager)
	kms.Generate()

	// 2. DID 생성. (메서드명과 퍼블릭 키를 넘김)
	did, err := core.NewDID(method, kms.PublicKeyMultibase())
	if err != nil {
		log.Printf("Failed to generate DID, error: %v\n", err)
	}

	// 3. DID Document 생성.
	// verificationId도 유일한 값이어야 하며, DID(유일한값) 뒤에다 무언갈 붙여도 유일한 값이다.
	// 뒤 키워드는 그냥 이해하라고 넣은거고 형식을 맞출 필요는 없다. (keys-1)
	verificationId := fmt.Sprintf("%s#keys-1", did)
	verificationMethod := []core.VerificationMethod{
		{
			Id: verificationId,
			// 암호화 키를 다른 키를 사용할 거라면, 위 const에서 찾거나 did document를 검색해서 찾아넣는다.
			Type: core.VERIFICATION_KEY_TYPE_SECP256K1,
			// 컨트롤러가 다를 수도 있다고 얘기했었다. 이건 did 자신이기 때문에 이렇게
			Controller:         did.String(),
			PublicKeyMultibase: kms.PublicKeyMultibase(),
		},
	}
	// didDocument를 생성한다. 만약 확장하고 싶으면 메서드를 뒤집어서 새로 만들어도 된다.
	didDocument := core.NewDIDDocument(did.String(), verificationMethod)

	fmt.Println("### Generate DID & DID Document ###")
	fmt.Printf("did => %s\n", did)
	fmt.Printf("did document => %+v\n", didDocument)

}
