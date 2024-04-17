package main

import (
	"fmt"
	"ssikr/config"
)

func main() {
	fmt.Println("Config Registrar address: ", config.SystemConfig.RegistrarAddr)
	fmt.Println("Config Resolver address: ", config.SystemConfig.ResolverAddr)
}
