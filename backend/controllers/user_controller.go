package controllers

import (
	// "crypto/sha256"
	// "crypto/subtle"
	"bytes"
	"fmt"
	"io/ioutil"
	database "server/database"

	// "html"
	"encoding/json"
	"io"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type OAuthAccessResponse struct {
	AccessToken string `json:"access_token"`
}

type dataExtract struct {
	Name  string `json:"name"`
	Login string `json:"login"`
	Email string `json:"email"`
}

var (
	//account_map   = make(map[string]string)
	client_id     = os.Getenv("CLIENT_ID")
	client_secret = os.Getenv("CLIENT_SECRET")
)

func OauthLogin() gin.HandlerFunc {
	return func(context *gin.Context) {
		// github token fetching with given code.
		code := context.Query("code")
		reqURL := fmt.Sprintf("https://github.com/login/oauth/access_token?client_id=%s&client_secret=%s&code=%s", client_id, client_secret, code)
		req, err := http.NewRequest(http.MethodPost, reqURL, nil)
		if err != nil {
			fmt.Fprintf(os.Stdout, "could not create HTTP request: %v", err)
			context.JSON(400, gin.H{"error": err.Error()})
		}

		// We set this header since we want the response as JSON
		req.Header.Set("accept", "application/json")
		httpClient := http.Client{}
		res, err := httpClient.Do(req)
		if err != nil {
			fmt.Fprintf(os.Stdout, "could not send HTTP request: %v", err)
			context.String(500, "Error in git token request")
		}
		bodyBytes, err := ioutil.ReadAll(res.Body)
		if err != nil {
			fmt.Fprintf(os.Stdout, "could not send HTTP request: %v", err)
			context.String(500, "Error in parsing body of git token request")
		}
		bodyString := string(bodyBytes)
		resp := generateResponseMap(bodyString, false)
		defer res.Body.Close()

		// github user details fetching.
		reqDataURL := "https://api.github.com/user"
		reqUser, err := http.NewRequest(http.MethodGet, reqDataURL, nil)
		if err != nil {
			fmt.Fprintf(os.Stdout, "could not create HTTP request: %v", err)
			context.JSON(400, gin.H{"error": err.Error()})
		}
		var token string = resp["access_token"]
		reqUser.Header.Set("accept", "application/vnd.github.v3+json")
		reqUser.Header.Set("authorization", "token "+resp["access_token"])
		resUser, err := httpClient.Do(reqUser)
		if err != nil {
			fmt.Fprintf(os.Stdout, "could not send HTTP request: %v", err)
			context.String(500, "Error in git user request")
		}
		bodyBytes, err = io.ReadAll(resUser.Body)
		bodyString = string(bodyBytes)
		resp = generateResponseMap(bodyString, true)
		var profileDetails map[string]interface{}
		json.Unmarshal([]byte(bodyString), &profileDetails)
		if err != nil {
			fmt.Fprintf(os.Stdout, "could not send HTTP request: %v", err)
			context.String(500, "Error in parsing body of git user request")
		}
		defer resUser.Body.Close()

		//details parsed from the response to add the details to the database
		userDetails := map[string]string{
			"name":     resp["name"],
			"username": resp["login"],
			"email":    resp["email"],
			"gittoken": token,
			"key":      uuid.New().String(),
		}
		dbConn := database.ConnectDB()
		result, existingUser := database.InsertRecords(dbConn, userDetails)

		// Finally, send a response to redirect the user to the homepage page with github auth cookie set for 7 days
		// TODO: Update localhost to URL later and change to Secure only
		context.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		context.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if result == "true" {
			context.JSON(200, gin.H{"token": userDetails["key"], "existing_user": existingUser, "profile_details": profileDetails})
		} else {
			context.JSON(400, gin.H{"error": result})
		}
	}
}

func generateResponseMap(bodyString string, useStruct bool) map[string]string {
	var d = []byte(bodyString)
	f := make(map[string]string)
	if useStruct {
		var c dataExtract
		g := json.Unmarshal(d, &c)
		inrec, _ := json.Marshal(c)
		json.Unmarshal(inrec, &f)
		if g != nil {
			panic(g)
		}
		return f
	}
	g := json.Unmarshal(d, &f)
	if g != nil {
		panic(g)
	}
	return f
}

func Logout() gin.HandlerFunc {
	return func(context *gin.Context) {
		token := context.Query("token")
		dbConn := database.ConnectDB()
		context.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		context.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		result := database.Logout(dbConn, token)
		if result == "true" {
			context.JSON(200, gin.H{"message": "Successfully logged out"})
		} else {
			context.JSON(400, gin.H{"error": result})
		}
	}
}

// The structure of the POST request from frontend:
// [ { 	"id": "xnisnw",
// 		"nickname1": [dep1, dep2, ..., dep5 ],
//   	"nickname2": [dep6, dep7, ..., dep9 ] }, ... ]

func QuickView() gin.HandlerFunc {
	return func(context *gin.Context) {
		token := context.Query("token") // user_id instead of token
		dbConn := database.ConnectDB()

		// get JSON from the body of the request
		// Read the Body content
		var bodyBytes []byte
		if context.Request.Body != nil {
			bodyBytes, _ = ioutil.ReadAll(context.Request.Body)
		}

		// Restore the io.ReadCloser to its original state
		context.Request.Body = ioutil.NopCloser(bytes.NewBuffer(bodyBytes))

		// Continue to use the Body, like Binding it to a struct:
		data, err := ioutil.ReadAll(context.Request.Body)
		var jsonData map[string]interface{}
		json.Unmarshal([]byte(data), &data)

		// Alternatively,
		// bodyAsByteArray, _ := ioutil.ReadAll(context.Request.Body)
		// jsonData := string(bodyAsByteArray)

		if err != nil {
			// Handle error
			fmt.Printf("Error loading resource")
		}

		// jsonData = [ { 	"nickname1": [dep1, dep2, ..., dep5 ],
		//   				"nickname2": [dep6, dep7, ..., dep9 ] }, ... ]

		// CREATE TABLE quickview_deployment_details (
		//     	id serial PRIMARY KEY,
		// 		nickname VARCHAR ( 255 ) UNIQUE NOT NULL,
		// 		userToken VARCHAR ( 255 ) UNIQUE NOT NULL,
		// 		kitIDs FOREIGN KEY ( kit_details )
		// );

		// for each nickname, loop through []:
		for nickname, depArray := range jsonData { // goes through keys
			// rec -> { "nickname1": [dep1, dep2, ..., dep5 ]
			for index, kitid := range depArray {
				sqlStatement := `INSERT INTO user_details (id, nickname, userToken, kitid) VALUES ($1, $2, $3, $4)`
				_, err = dbConn.Exec(sqlStatement, client_id, nickname, token, kitid)

			}

		}
		dbConn.Close()
	}
}

func GetQuickViewList() gin.HandlerFunc {
	return func(context *gin.Context) {
	}
}
