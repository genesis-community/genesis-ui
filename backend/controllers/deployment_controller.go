package controllers

import (
	//ctx "context"

	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	vault "github.com/hashicorp/vault/api"

	// "github.com/google/go-github/v43/github"
	// "golang.org/x/oauth2"
	// "log"
	"net/http"
	"os"
	database "server/database"
)

func LoadDeployments(path string, name string) map[string]interface{} {
	client := CreatClient()
	director := path + name
	data_path := os.Getenv("VAULT_DATA_PREFIX")
	result := make(map[string]interface{}) // {"code": http status code, "meg": error message or kit details}
	secret, err := client.Logical().Read(data_path + director)
	if err != nil {
		fmt.Fprintf(os.Stderr, "client.Logical().Read(%s): %+v\n", data_path+director, err)
		result = map[string]interface{}{"code": http.StatusUnauthorized, "meg": "Check your permission."}
	} else if secret == nil {
		fmt.Fprintf(os.Stderr, "client.Logical().Read(%s): Secret not found!\n", data_path+director)
		result = map[string]interface{}{"code": http.StatusNotFound, "meg": "Marco: Give me " + name + "! Polo: " + name + "?"}
	} else {
		data := secret.Data["data"].(map[string]interface{})
		result["kit_name"] = name
		keys := []string{"kit_is_dev", "dated", "deployer", "kit_version", "features"}
		for _, key := range keys {
			if val, ok := data[key]; ok {
				result[key] = val
			} else {
				result[key] = "N/A"
			}
		}
		result = map[string]interface{}{"code": http.StatusOK, "meg": result}
	}
	return result
}

func ListDeployments() gin.HandlerFunc { // for listing deployments and kit details by LoadDeployments.
	return func(context *gin.Context) {
		token, _ := context.Cookie("Token") // Github save for future
		fmt.Println("Token: " + token)
		// Auth will be check here
		// log will be add later
		client := CreatClient()
		list_path := os.Getenv("VAULT_LIST_PREFIX")
		sub_path := strings.Split(context.Params.ByName("any"), "/")[1:]
		if len(sub_path) == 2 { // snw-name-lab/kit-name to get kit details
			if sub_path[len(sub_path)-1] != "" {
				path := sub_path[0] + "/"
				name := sub_path[1]
				kit_detail := LoadDeployments(path, name)
				context.JSON(kit_detail["code"].(int), kit_detail["meg"])
			} else {
				list_path = list_path + sub_path[0]
				sub_path = sub_path[:len(sub_path)-1]
			}
		} else if len(sub_path) == 1 { // snw-name-lab
			if sub_path[len(sub_path)-1] != "" {
				list_path = list_path + sub_path[0]
			} else {
				sub_path = sub_path[:len(sub_path)-1]
				sub_path = append(sub_path, "just list")
			}
		} else {
			fmt.Fprintf(os.Stderr, "ListDeployments path incorrect or tailing /: %v\n", sub_path)
			context.JSON(http.StatusBadRequest, "Check your path.")
		}
		if len(sub_path) < 2 && sub_path[len(sub_path)-1] != "" { // getting list deployments or list kits
			secret_list, err := client.Logical().List(list_path)
			if err != nil {
				fmt.Fprintf(os.Stderr, "client.Logical().List(%s): %+v\n", list_path, err)
				context.JSON(http.StatusUnauthorized, "Check your permission.")
			} else if secret_list == nil {
				fmt.Fprintf(os.Stderr, "client.Logical().List(%s): Secret List not found!\n", list_path)
				context.JSON(http.StatusNotFound, "Marco: Give me "+sub_path[0]+"! Polo: What?")
			} else {
				deploys := secret_list.Data["keys"].([]interface{})
				if sub_path[len(sub_path)-1] == "just list" {
					context.JSON(http.StatusOK, gin.H{"deploy_list": deploys})
				} else {
					detail_map := make(map[string]interface{})
					for _, kit_name := range deploys {
						path := sub_path[0] + "/"
						name := kit_name.(string)
						current_kit := LoadDeployments(path, name)
						if current_kit["code"].(int) != http.StatusOK {
							detail_map["error"] = current_kit["meg"]
						} else {
							detail_map[kit_name.(string)] = current_kit["meg"]
						}
					}
					context.JSON(http.StatusOK, detail_map)
				}

			}

		}
	}
}

func CreatClient() *vault.Client {
	config := &vault.Config{
		Address: os.Getenv("VAULT_ADDR"),
	}
	client, err := vault.NewClient(config)
	if err != nil {
		fmt.Fprintf(os.Stderr, "CreatClient() vault.NewClient(%+v): %+v\n", config, err)
		os.Exit(1)
	}
	client.SetToken(os.Getenv("VAULT_TOKEN"))
	if config.Error != nil {
		fmt.Fprintf(os.Stderr, "CreatClient() config error: %+v\n", config.Error)
		os.Exit(1)
	}
	return client
}

/*GetDeployment controller function to get the list of all deployments or
kit info about a particular deployment*/

func GetDeployments() gin.HandlerFunc {
	return func(context *gin.Context) {
		fmt.Println(context.Params.ByName("any"))
		param := strings.Split(context.Params.ByName("any"), "/")[1:]
		deployment_name := ""
		if len(param) == 2 {
			if param[0] != " " { // buffalo-lab/ form the correct deployment name to query info about it
				deployment_name = param[0] + "/"
			}
		} else if len(param) == 1 { // if the len of param is "1" then just get the list of deployments
			deployment_name = "just list"
		} else {
			context.JSON(400, gin.H{"error": "no deployments"})
		}
		if deployment_name != "just list" {
			dbConn := database.ConnectDB()
			status := false
			deployment_details := make(map[string]interface{})
			status, deployment_details = database.GetDeploymentDetails(dbConn, deployment_name)
			if status == true {
				context.JSON(200, deployment_details)
			} else {
				context.JSON(400, gin.H{"error": "no deployment"})
			}

		} else {
			dbConn := database.ConnectDB()
			status := false
			var deployments []string
			status, deployments = database.ListDeployments(dbConn)
			if status == true {
				context.JSON(200, gin.H{"deploy_list": deployments})
			} else {
				context.JSON(400, gin.H{"error": "no deployments"})
			}
		}

	}
}
