package main

import (
	"github.com/gin-gonic/gin"
	"server/routes"
)

func main() {
	router := gin.Default()
	routes.HandleRoutes(router)
	router.Run(":3000") // listen on local host 0.0.0.0:3000
}
