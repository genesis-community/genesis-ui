package main

import (
	// "html/template"
	// "os"
	"crypto/sha256"
	"crypto/subtle"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	router.GET("/", func(context *gin.Context) {
		context.File("public/login.html")
	})

	router.StaticFile("assets/images/S&W logo.png", "./public/assets/images/S&W logo.png")

	router.GET("assets/images/titleBar.png", func(context *gin.Context) {
		context.File("./public/assets/images/titleBar.png")
	})

	router.GET("/loginPage", func(context *gin.Context) {
		context.File("public/loginPage.html")
	})

	router.POST("/loginAuth", func(context *gin.Context) {
		username := context.PostForm("uname")
		password := context.PostForm("psw")

		inputusernameHash := sha256.Sum256([]byte(username))
		inputpasswordHash := sha256.Sum256([]byte(password))
		storedusernameHash := sha256.Sum256([]byte("Admin"))
		storedpasswordHash := sha256.Sum256([]byte("Admin"))

		usernameMatch := (subtle.ConstantTimeCompare(inputusernameHash[:], storedusernameHash[:]) == 1)
		passwordMatch := (subtle.ConstantTimeCompare(inputpasswordHash[:], storedpasswordHash[:]) == 1)

		if usernameMatch && passwordMatch {
			context.Redirect(http.StatusFound, "/homepage")
		} else {
			fmt.Println("Either Username or Password is Wrong! Please try again!")
		}
	})

	router.GET("/homepage", func(context *gin.Context) {
		context.File("public/homepage.html")
	})

	router.Run(":3000") // listen on local host 0.0.0.0:3000
}
