Initial commit

# Blood Donation DID Project
- create go.mod - ok
- create actors
- config
- core
- did_db/dids -> blockchain connect
- util

# etc
- see examples

# run create
- create mod file: `go mod init blood`
- write proto file
- protobuf install: `brew install protobuf`
- proto compiler install
    - `brew install protoc-gen-go`
    - `brew install protoc-gen-go-grpc`
- install grpc: `go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest`
- protoc compile
    ```
        protoc --go_out=. \
        --go_opt=paths=source_relative \
        --go-grpc_out=. \
        --go-grpc_opt=paths=source_relative protos/*.proto
    ```
- install buf: `brew install bufbuild/buf/buf`
- buf setting: `buf mod init`
    -> created buf.yaml file
- create 'buf.gen.yaml' file
    ```
        version: v1
        plugins:
        - plugin: buf.build/protocolbuffers/go
            out: ./
            opt: paths=source_relative
        - plugin: buf.build/grpc/go
            out: ./
            opt: paths=source_relative
    ```
- buf generate
