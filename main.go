package main

import (
	// "fmt"
	// "html/template"
	// "net/http"
	// "os"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.GET("/", func(context *gin.Context) {
		context.File("login.html")
	})
	router.StaticFile("images/S&W logo.png", "./images/S&W logo.png")
	router.GET("images/titleBar.png", func(context *gin.Context) {
		context.File("./images/titleBar.png")
	})

	router.Run(":8080") // listen on local host 0.0.0.0:3000
}
