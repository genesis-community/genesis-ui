package routes

import (
	"server/controllers"

	"github.com/gin-gonic/gin"
	// "net/http"
)

func HandleRoutes(router *gin.Engine) {
	// router.Static("/assets", "public/assets")

	router.GET("/list/*any", controllers.ListDeployments())
	router.GET("/auth", controllers.OauthLogin())
	router.GET("/logout", controllers.Logout())
	router.POST("/qview", controllers.QuickView())
	router.DELETE("/qview", controllers.DeleteQuickView())
	router.GET("/qview", controllers.GetQuickViewList())
	router.GET("/user", controllers.GetUserDetails())
}
