package controllers

import (
	// "crypto/sha256"
	// "crypto/subtle"
	"fmt"
	"server/configs"

	// "html"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

type OAuthAccessResponse struct {
	AccessToken string `json:"access_token"`
}

var (
	account_map   = make(map[string]string)
	client_id     = os.Getenv("CLIENT_ID")
	client_secret = os.Getenv("CLIENT_SECRET")
)

func OauthLogin() gin.HandlerFunc {
	return func(context *gin.Context) {
		code := context.Query("code")
		reqURL := fmt.Sprintf("https://github.com/login/oauth/access_token?client_id=%s&client_secret=%s&code=%s", client_id, client_secret, code)
		req, err := http.NewRequest(http.MethodPost, reqURL, nil)
		if err != nil {
			fmt.Fprintf(os.Stdout, "could not create HTTP request: %v", err)
			context.JSON(400, gin.H{"error": err.Error()})
		}
		// We set this header since we want the response
		// as JSON
		req.Header.Set("accept", "application/json")
		// Send out the HTTP request
		httpClient := http.Client{}
		res, err := httpClient.Do(req)
		if err != nil {
			fmt.Fprintf(os.Stdout, "could not send HTTP request: %v", err)
			context.String(500, "unknown")
		}
		defer res.Body.Close()

		// Parse the request body into the `OAuthAccessResponse` struct
		var t OAuthAccessResponse
		if err := json.NewDecoder(res.Body).Decode(&t); err != nil {
			fmt.Fprintf(os.Stdout, "could not parse JSON response: %v", err)
			context.JSON(400, gin.H{"error": err.Error()})
		}

		// Finally, send a response to redirect the user to the homepage page with github auth cookie set for 7 days
		// TODO: Update localhost to URL later and change to Secure only
		context.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		context.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		configs.ConnectDB()
		context.JSON(200, gin.H{"token": t.AccessToken})
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
