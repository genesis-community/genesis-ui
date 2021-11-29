package main

import (
	"crypto/sha256"
	"crypto/subtle"
	"fmt"
	"html"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	vault "github.com/hashicorp/vault/api"
)

func main() {
	config := &vault.Config{
		Address: os.Getenv("VAULT_ADDR"),
	} // modify for more granular configuration

	client, err := vault.NewClient(config)
	if err != nil {
		fmt.Fprintf(os.Stderr, "vault.NewClient(%+v): %+v\n", client, err)
		return
	}
	client.SetToken(os.Getenv("VAULT_TOKEN"))
	path := os.Getenv("VAULT_PREFIX")
	// ver_name := "bosh"
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
		username := html.EscapeString(context.PostForm("uname"))
		password := html.EscapeString(context.PostForm("psw"))

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
	router.StaticFile("/script.js", "./public/assets/js/script.js")
	router.GET("/homepage", func(context *gin.Context) {
		context.File("public/homepage.html")
		//secret/exodus/snw-klin-lab/bosh:kit_version
		name, err := client.Logical().Read(path + "snw-klin-lab/bosh:kit_name")
		if err != nil {
			fmt.Fprintf(os.Stderr, "client.Logical().Read(%s): %+v\n", path, err)
			return
		}
		fmt.Print(os.Getenv("VAULT_TOKEN"))
		fmt.Printf("%+v\n", name)
		fmt.Print(path + "snw-klin-lab/bosh" + ":kit_name")
		version, err := client.Logical().Read(path + "snw-klin-lab/bosh:kit_version")
		if err != nil {
			fmt.Fprintf(os.Stderr, "client.Logical().Read(%s): %+v\n", path, err)
			return
		}
		fmt.Printf("%+v", version)
		//context.JSON(http.StatusOK, gin.H{"name": name, "version": version})
	})

	router.Run(":3000") // listen on local host 0.0.0.0:3000
}
