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
		if config.Error != nil {
			fmt.Fprintf(os.Stderr, "config set up incorrect: %+v\n", config.Error)
			return
		}
		//context.File("public/homepage.html")
		//secret/exodus/snw-klin-lab/bosh:kit_version

		director := "snw-klin-lab" // TODO: How to pass this in as an option / parameter

		secret, err := client.Logical().Read(path + director + "/bosh")
		if err != nil {
			fmt.Fprintf(os.Stderr, "client.Logical().Read(%s): %+v\n", path, err)
			return
		}
		if secret == nil {
			fmt.Fprintf(os.Stderr, "client.Logical().Read(%s): Secret not found!\n", path)
			return
		}

		data := secret.Data["data"].(map[string] interface{})

		// Debugging, see what's in there :) 
		//for k,v := range data{
		//	fmt.Fprintf(os.Stderr, "%s: %+v\n", k, v)
		//}

		kit_name := data["kit_name"].(string)
		kit_version := data["kit_version"].(string)

		context.JSON(http.StatusOK, gin.H{"kit_name": kit_name, "kit_version": kit_version})
	})

	router.Run(":3000") // listen on local host 0.0.0.0:3000
}
