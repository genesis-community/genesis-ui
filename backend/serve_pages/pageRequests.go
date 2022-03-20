package serve_pages

import (
	"github.com/gin-gonic/gin"
)

func ServeRootPage() gin.HandlerFunc {
	return func(context *gin.Context) {
		context.HTML(200, "login.html", nil)
		return
	}
}

func ServeHomePage() gin.HandlerFunc {
	return func(context *gin.Context) {
		context.HTML(200, "homepage.html", nil)
		return
	}
}

func ServeLoginPage() gin.HandlerFunc {
	return func(context *gin.Context) {
		context.HTML(200, "login-github.html", nil)
		return
	}
}
