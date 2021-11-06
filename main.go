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
		context.File("templates/login.html")
	})
	router.StaticFile("images/S&W logo.png", "./images/S&W logo.png")
	router.GET("images/titleBar.png", func(context *gin.Context) {
		context.File("./images/titleBar.png")
	})

	router.Run(":3000") // listen on local host 0.0.0.0:3000
	http.ListenAndServe("localhost:3000", nil)

	//run login
	http.HandleFunc("templates/loginPage", loginHandler)

	//run loginAuth
	http.HandleFunc("/loginAuth", loginAuthHandler)
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	router := gin.Default()
	print("Reached Login Handler")
	fmt.Println("LoginHandler Running")
	router.GET("/templates/loginPage.html", func(context *gin.Context) {
		context.File("templates/loginPage.html")
	})

}

func loginAuthHandler(w http.ResponseWriter, r *http.Request) {
	router := gin.Default()
	fmt.Println("********** Login Auth Handler Running **********")
	r.ParseForm()
	username := r.FormValue("uname")
	password := r.FormValue("psw")

	inputusernameHash := sha256.Sum256([]byte(username))
	inputpasswordHash := sha256.Sum256([]byte(password))
	storedusernameHash := sha256.Sum256([]byte("Admin"))
	storedpasswordHash := sha256.Sum256([]byte("Admin"))

	usernameMatch := (subtle.ConstantTimeCompare(inputusernameHash[:], storedusernameHash[:]) == 1)
	passwordMatch := (subtle.ConstantTimeCompare(inputpasswordHash[:], storedpasswordHash[:]) == 1)

	//if username and password hashes match\
	if usernameMatch && passwordMatch {
		fmt.Println("You have successfully logged in !")
		router.GET("/", func(context *gin.Context) {
			context.File("homepage.html")
		})
	} else {
		fmt.Println("Either Username or Password is Wrong! Please try again!")
	}

}

// func basicAuth(next http.HandlerFunc) http.HandlerFunc {
// 	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		//Extracting the username and password from the request
// 		//Authorization Header. If no Authentication header is present
// 		//or header value is invalid then return False

// 		username, password, ok := r.BasicAuth()

// 		if ok {

// 			//SHA256 hashes for usernames and passwords
// 			usernameHash := sha256.Sum256([]byte(username))
// 			passwordHash := sha256.Sum256(([]byte(password)))
// 			expectedusernameHash := sha256.Sum256([]byte("Admin"))
// 			expectedPasswordHash := sha256.Sum256([]byte("Admin"))

// 			//comparing input username and password with set username and password
// 			//with subtle.constanttimecompare to avoid timing attacks.

// 			usernameMatch := (subtle.ConstantTimeCompare(usernameHash[:], expectedusernameHash[:]) == 1)
// 			passwordMatch := (subtle.ConstantTimeCompare(passwordHash[:], expectedPasswordHash[:]) == 1)

// 			//if username and password are correct then calling next Handler in the chain.

// 			if usernameMatch && passwordMatch {
// 				next.ServeHTTP(w, r) //needs to be tweaked
// 				return
// 			}
// 		}

// 		//If authentication wrong/ absent --> Informing about a 401 Unauthorized response.

// 		w.Header().Set("WWW-Authenticate", `Basic realm = "restricted", charset = "UTF-8"`)
// 		http.Error(w, "Unauthorized", http.StatusUnauthorized)
// 	})

// }
