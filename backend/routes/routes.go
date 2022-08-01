package routes

import (
	"server/controllers"

	"github.com/gin-gonic/gin"
	// "net/http"
)

func HandleRoutes(router *gin.Engine) {
	// router.Static("/assets", "public/assets")

	router.GET("/list/*any", controllers.GetDeployments())
	router.GET("/auth", controllers.OauthLogin())
	router.GET("/logout", controllers.Logout())
	router.GET("/user", controllers.GetUserDetails())
	router.POST("/addQuickview",controllers.AddQuickView())
	router.GET("/quickviews", controllers.GetQuickViews())
	router.POST("/deleteQuickview", controllers.DeleteQuickViews())
	
}
