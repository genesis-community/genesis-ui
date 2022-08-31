package main

import (
	"server/routes"

	database "server/database"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	//pull the data from vault and load it to the database
	database.CheckAndUpdateDeployments(database.LoadDeployments())
	router := gin.Default()
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	routes.HandleRoutes(router)
	router.Use(cors.New(config))
	router.Run(":8000") // listen on local host 0.0.0.0:8000

}
