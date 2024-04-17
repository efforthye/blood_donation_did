// go run examples/did/ex2/main.go
package main

import (
	"errors"
	"fmt"
	"log"
	"ssikr/core"
	"ssikr/util"
)

// DID를 만들어주는 함수(메서드와 퍼블릭 키를 받는다.)
// 오늘은 퍼블릭 키로 spec 키를 만들어 본다.
func NewDID(method string, pbKey string) (string, error) {
	if method == "" || pbKey == "" {
		return "", errors.New("parameter is not valid")
	}

	// 유일하고 특정한 값을 만든다.
	specificIdentifier := util.MakeHashBase58(pbKey)

	// DID:Method:specific
	did := fmt.Sprintf("did:%s:%s", method, specificIdentifier)

	return did, nil
}

// 생성할 때마다 다른 DID가 실행되므로, 여러번 이 main함수를 실행해서 다른게 출력되는지 확인
func main() {
	// 메서드 명 우선 정의
	var method = "ssikr"

	// 키 관리 시스템이라는 의미의 변수에 프라이빗키, 퍼블릭키를 생성한다.
	kms := new(core.ECDSAManager)
	kms.Generate()

	// 메서드를 넣고, 키의 퍼블릭 키를 넣는다.
	did, err := NewDID(method, kms.PublicKeyMultibase())

	if err != nil {
		log.Printf("Failed to generate DID, error: %v\n", err)
	}

	fmt.Println("### New DID ###")
	fmt.Printf("did => %s\n", did)
}
