package controllers

import (
	// "crypto/sha256"
	// "crypto/subtle"
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

type quickview struct{
	Name string `json:"name"`
	Deployments []string `json:"deployments"`
	Kitname []string `json:"kitname"`
}

/*OauthLogin function will authenticate the user logging 
in with the Github Oauth -web app flow using the client id and client secret for the registred application 
and get the user details from github and save it to the database.*/
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
		context.SetCookie("Token", token, 604800, "/", "localhost", false, true)
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
		result := database.LogoutDB(dbConn, token)
		if result == "true" {
			context.JSON(200, gin.H{"message": "Successfully logged out"})
		} else {
			context.JSON(400, gin.H{"error": result})
		}
	}
}
/*GetUserDetails function fetches the user details using the github api call
using the gitoken from the database for an existing user*/

func GetUserDetails() gin.HandlerFunc {
	return func(context *gin.Context) {
		token := context.Query("token")
		dbConn := database.ConnectDB()
		accessToken := ""
		result := false
		userDetails:=make(map[string]string)
		result,userDetails= database.GetUserDetailsDB(dbConn, token)
		accessToken=userDetails["accessToken"]

		// github user details fetching.
		reqDataURL := "https://api.github.com/user"
		reqUser, err := http.NewRequest(http.MethodGet, reqDataURL, nil)
		if err != nil {
			fmt.Fprintf(os.Stdout, "could not create HTTP request: %v", err)
			context.JSON(400, gin.H{"error": err.Error()})
		}
		reqUser.Header.Set("accept", "application/vnd.github.v3+json")
		reqUser.Header.Set("authorization", "token "+accessToken)
		httpClient := http.Client{}
		resUser, err := httpClient.Do(reqUser)
		if err != nil {
			fmt.Fprintf(os.Stdout, "could not send HTTP request: %v", err)
			context.String(500, "Error in git user request")
		}
		bodyBytes, err := io.ReadAll(resUser.Body)
		bodyString := string(bodyBytes)
		var profileDetails map[string]interface{}
		json.Unmarshal([]byte(bodyString), &profileDetails)
		if err != nil {
			fmt.Fprintf(os.Stdout, "could not send HTTP request: %v", err)
			context.String(500, "Error in parsing body of git user request")
		}
		defer resUser.Body.Close()

		context.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		context.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if result == true {
			context.JSON(200, gin.H{"profile_details": profileDetails})
		} else {
			context.JSON(400, gin.H{"error": "Invalid token"})
		}
	}
}
/*
AddQuickView will add quickview 
to the table quickviews and will create 
records into table quickviews_values for each quickview type for each user 
*/
func AddQuickView() gin.HandlerFunc {
	return func(context *gin.Context){
		token := context.Query("token")
		var qv quickview
		
		if err:=context.ShouldBindJSON(&qv);err!=nil{
			return 
		}
		//need to add the userdetails map  as a parameter 
		userDetails:=make(map[string]string)
		quickview_map:=make(map[string][]string)
		quickview_map["deployments"]=qv.Deployments
		quickview_map["kitname"]=qv.Kitname
		qv_name:=qv.Name
		dbConn:=database.ConnectDB()
		result:=false
		result,userDetails= database.GetUserDetailsDB(dbConn, token)
		dbConn=database.ConnectDB() 
		msg,status:=database.AddQuickView(dbConn,qv_name,quickview_map,userDetails)

		if status==true && result==true {
			context.JSON(200,gin.H{"message":msg})
		}else{
			context.JSON(400,gin.H{"error":msg})
		}

		

	}

}
/*
GetUserQuickViews will give the list of quickviews available for 
each user from the database
*/
func GetQuickViews() gin.HandlerFunc{
	return func(context *gin.Context){
		token := context.Query("token")
		dbConn:=database.ConnectDB()
		userDetails:=make(map[string]string)
		result:=false
		result,userDetails= database.GetUserDetailsDB(dbConn, token)
        dbConn=database.ConnectDB()
		status,qv,err:=database.GetUserQuickViews(dbConn,userDetails)
		quickviews:=qv
		if status==true && result==true {
			context.JSON(200,gin.H{"quickviews":quickviews})
		}else{
			context.JSON(400,gin.H{"error":err})
		}
	}
}

func DeleteQuickViews() gin.HandlerFunc{
	return func(context *gin.Context){
		token := context.Query("token")
		var qv quickview
		if err:=context.ShouldBindJSON(&qv);err!=nil{
			return 
		}
		qv_name:=qv.Name
		dbConn:=database.ConnectDB()
		userDetails:=make(map[string]string)
		result:=false
		result,userDetails= database.GetUserDetailsDB(dbConn, token)
        dbConn=database.ConnectDB()
		msg,status:=database.DeleteQuickViews(dbConn,qv_name,userDetails)
		if status==true && result==true {
			context.JSON(200,gin.H{"message":msg})
		}else{
			context.JSON(400,gin.H{"error":msg})
		}
	}
}