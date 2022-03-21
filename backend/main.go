package main

import (
	"server/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	routes.HandleRoutes(router)
	router.Use(cors.New(config))
	router.Run(":8000") // listen on local host 0.0.0.0:8000
}
