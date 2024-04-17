// examples/did/ex1/main.go
package main

import "fmt"

// DID는 단순 식별자로 W3C에서 제시하는 표준 형식을 따른다.
// https://www.w3.org/TR/did-core/
func main() {
	// 각자 프로젝트 명으로 바꾸어도 상관 없다.
	method := "ssikr"
	// 메소드 내에서 유일한 값이어야 한다.
	specificIdentifier := "abcd1234"

	// DID 표준 형식으로 문자열을 생성한다. (첫번째 %s: method, 두번째: spec...)
	// method 명이 중복되지 않도록 하기위해 유니버셜 레지스트리 같은 것이 있다고 하여서 거기에 등록해야 한다.
	// 국내 프로젝트도 몇개 등록되어 있다고 한다. 중복되지 않게 미리 준비하여야 한다.
	// 등록 포맷은 깃허브에 있어서 가져와서 올리면 자동으로 액션 통과된다고 한다.
	// 리졸버나 레지스트리나 구현 문서가 있어야 통과할 수도 있다.
	// [did:DID Method:DID Method-Specific Identifier]
	// vdr, 메서드 중복 관련: https://github.com/decentralized-identity/universal-resolver
	// specificIdentifier.. pki는 우주적으로 유일하다.. 라고 알려져 있기 때문에 그것을 사용하여도 된다.
	// 표준은 없으나 오늘은 퍼블릭 키를 활용한다.
	did := fmt.Sprintf("did:%s:%s", method, specificIdentifier)

	// pki 키를 통하여 생성된 DID 출력
	fmt.Printf("DID: %s\n", did)
}
