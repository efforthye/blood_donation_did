// export를 새로 해 주어야 함.
// examples/vdr/ex_vdr.go
package main

import (
	"fmt"
	"log"
	"ssikr/core"
)

func main() {
	var method = "ssikr"

	// PKI key 생성.
	kms := new(core.ECDSAManager)
	kms.Generate()

	// DID 생성.
	did, err := core.NewDID(method, kms.PublicKeyMultibase())

	if err != nil {
		log.Printf("Failed to generate DID, error: %v\n", err)
	}

	// DID Document 생성.
	verificationId := fmt.Sprintf("%s#keys-1", did)
	verificationMethod := []core.VerificationMethod{
		{
			Id:                 verificationId,
			Type:               core.VERIFICATION_KEY_TYPE_SECP256K1,
			Controller:         did.String(),
			PublicKeyMultibase: kms.PublicKeyMultibase(),
		},
	}
	didDocument := core.NewDIDDocument(did.String(), verificationMethod)

	fmt.Println("### New DID ###")
	fmt.Printf("did => %s\n", did)
	fmt.Printf("did document => %+v\n", didDocument)

	// 아래 코드와 비슷한데 감싼거임.
	// Register DID with DID Document
	RegisterDid(did.String(), didDocument)

	// 아래 코드
	// Resolve DID
	didDocumentStr, err := core.ResolveDid(did.String())
	if err != nil {
		log.Printf("Failed to Resolve DID.\nError: %x\n", err)
	}

	fmt.Printf("did document => %+v\n", didDocumentStr)
}

// Register DID
func RegisterDid(did string, document *core.DIDDocument) error {
	err := core.RegisterDid(did, document.String())
	if err != nil {
		return err
	}
	return nil
}
