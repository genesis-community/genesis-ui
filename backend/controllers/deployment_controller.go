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
)

func LoadDeployments(director string) map[string]interface{} {
	client := CreatClient()
	data_path := os.Getenv("VAULT_DATA_PREFIX")
	result := make(map[string]interface{}) // {"code": http status code, "meg": error message or kit details}
	secret, err := client.Logical().Read(data_path + director)
	if err != nil {
		fmt.Fprintf(os.Stderr, "client.Logical().Read(%s): %+v\n", data_path+director, err)
		result = map[string]interface{}{"code": http.StatusUnauthorized, "meg": "Access error."}
	} else if secret == nil {
		fmt.Fprintf(os.Stderr, "client.Logical().Read(%s): Secret not found!\n", data_path+director)
		result = map[string]interface{}{"code": http.StatusNotFound, "meg": "Marco: Give me my file! \n Polo: What file?"}
	} else {
		data := secret.Data["data"].(map[string]interface{})
		keys := []string{"kit_name", "kit_is_dev", "dated", "deployer", "kit_version", "features"}
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
				path := sub_path[0] + "/" + sub_path[1]
				kit_detail := LoadDeployments(path)
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
				context.JSON(http.StatusUnauthorized, err)
			} else if secret_list == nil {
				fmt.Fprintf(os.Stderr, "client.Logical().List(%s): Secret List not found!\n", list_path)
				context.JSON(http.StatusNotFound, "Marco: Give me my file! \n Polo: What file?")
			} else {
				deploys := secret_list.Data["keys"].([]interface{})
				if sub_path[len(sub_path)-1] == "just list" {
					context.JSON(http.StatusOK, gin.H{"deploy_list": deploys})
				} else {
					detail_map := make(map[string]interface{})
					for _, kit_name := range deploys {
						path := sub_path[0] + "/" + kit_name.(string)
						current_kit := LoadDeployments(path)
						detail_map[kit_name.(string)] = current_kit["meg"]
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
	// path := os.Getenv("VAULT_PREFIX")
	if config.Error != nil {
		fmt.Fprintf(os.Stderr, "CreatClient() config error: %+v\n", config.Error)
		os.Exit(1)
	}
	return client
}
