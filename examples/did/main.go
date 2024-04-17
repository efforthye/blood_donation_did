// examples/did/main.go
package main

import (
	"fmt"
	core "ssikr/core"
)

func main() {
	// 현재 인자가 같아서 똑같은 값이 계속 나오는데, 원래는 키값 이런거 바꿔줘야 됨
	did, _ := core.NewDID("test", "12345")

	fmt.Printf("DID: [%s]", did.String())

}
