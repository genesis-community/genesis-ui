package controllers

import (
	"crypto/sha256"
	"crypto/subtle"
	"fmt"
	"html"
	"net/http"
	// "os"
	"github.com/gin-gonic/gin"
	"io/ioutil"
)

var (
	account_map = make(map[string]string)
	client_secret = getOauthSecret()
)

const client_id = "d8ca7de576a6e29f75ca"
func OauthLogin() gin.HandlerFunc {
	return func(context *gin.Context) {
		//Add Ouath logic here
	}
}

func ProcessLogin() gin.HandlerFunc {
	return func(context *gin.Context) {
		username := html.EscapeString(context.PostForm("uname"))
		password := html.EscapeString(context.PostForm("psw"))

		inputusernameHash := sha256.Sum256([]byte(username))
		inputpasswordHash := sha256.Sum256([]byte(password))
		// change to access DB in future
		usernameInDB := username
		passwordInDB := password
		storedusernameHash := sha256.Sum256([]byte(usernameInDB))
		storedpasswordHash := sha256.Sum256([]byte(passwordInDB))

		usernameMatch := (subtle.ConstantTimeCompare(inputusernameHash[:], storedusernameHash[:]) == 1)
		passwordMatch := (subtle.ConstantTimeCompare(inputpasswordHash[:], storedpasswordHash[:]) == 1)
		account_map["cookie/token"] = username // add to map for later loop up

		if usernameMatch && passwordMatch {
			context.Redirect(http.StatusFound, "/homepage")
			// Need to know how frontend team is processing login info
			} else {
			fmt.Println("Either Username or Password is Wrong! Please try again!")
		}
		return 
	}
}

func getOauthSecret() string {
	file, err := ioutil.ReadFile("oauth_secret.txt")
	if err != nil {
		fmt.Println("failed to open secret file")
	}
	return string(file)
}