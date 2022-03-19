package routes

import (
	"server/controllers"
	pages "server/serve_pages"

	"github.com/gin-gonic/gin"
	// "net/http"
)

func HandleRoutes(router *gin.Engine) {
	// Loads all HTML files in Gin's file handler
	router.LoadHTMLGlob("public/*.html")
	// Serves any file found in the directory
	router.Static("/assets", "public/assets")

	router.GET("/", pages.ServeRootPage())
	router.GET("/homepage", pages.ServeHomePage())
	router.GET("/loginPage", pages.ServeLoginPage())
	// router.GET("/bosh", controllers.LoadDeployments())
	router.GET("/oauth/redirect", controllers.OauthLogin())
	router.GET("/list/*any", controllers.ListDeployments())
}
