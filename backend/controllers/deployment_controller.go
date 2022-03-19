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
		result = map[string]interface{}{"code": http.StatusNotFound, "meg": "You say: Marco! \n Your item: Polo?"}
	} else {
		data := secret.Data["data"].(map[string]interface{})
		kit_name_dev := data["kit_name"].(string) + "(" + data["kit_is_dev"].(string) + ")"
		deploy_date := data["dated"].(string)
		deployer := data["deployer"].(string)
		kit_version := data["kit_version"].(string)
		features := data["features"].(string)
		result = map[string]interface{}{"code": http.StatusOK, "meg": map[string]string{"kit_name_dev": kit_name_dev, "deploy_date": deploy_date, "deployer": deployer, "kit_version": kit_version, "features": features}}
	}
	return result
}

func ListDeployments() gin.HandlerFunc { // for listing deployments and kit details by LoadDeployments.
	return func(context *gin.Context) {
		token, _ := context.Cookie("Token") // Github save for future
		fmt.Println("Token: " + token)
		client := CreatClient()
		list_path := os.Getenv("VAULT_LIST_PREFIX")
		sub_path := strings.Split(context.Params.ByName("any"), "/")[1:]
		if len(sub_path) == 2 { // snw-name-lab/kit-name to get kit details
			if sub_path[len(sub_path)-1] != "" {
				fmt.Printf("2 items: %v\n", sub_path)
				path := sub_path[0] + "/" + sub_path[1]
				kit_detail := LoadDeployments(path)
				context.JSON(kit_detail["code"].(int), kit_detail["meg"])
			} else {
				fmt.Printf("2 before: %v\n", sub_path)
				list_path = list_path + sub_path[0]
				sub_path = sub_path[:len(sub_path)-1]
				fmt.Printf("2 after: %v\n", sub_path)
			}
		} else if len(sub_path) == 1 { // snw-name-lab
			if sub_path[len(sub_path)-1] != "" {
				fmt.Printf("1 items: %v\n", sub_path)
				list_path = list_path + sub_path[0]
			} else {
				fmt.Printf("1 before: %v\n", sub_path)
				sub_path = sub_path[:len(sub_path)-1]
				sub_path = append(sub_path, "just list")
				fmt.Printf("1 after: %v\n", sub_path)
			}
		} else {
			fmt.Printf("sub_path incorrect or tailing /: %v\n", sub_path)
		}
		//
		// fmt.Printf("dir: %s\n kit: %s\n", directory, kit_name)
		// if (directory == nil) && (kit_name == nil) {

		// }
		if len(sub_path) < 2 && sub_path[len(sub_path)-1] != "" { // getting list deployments or list kits
			secret_list, err := client.Logical().List(list_path)
			if err != nil {
				fmt.Fprintf(os.Stderr, "client.Logical().List(%s): %+v\n", list_path, err)
				context.JSON(http.StatusUnauthorized, err)
			} else if secret_list == nil {
				fmt.Fprintf(os.Stderr, "client.Logical().List(%s): Secret List not found!\n", list_path)
				context.JSON(http.StatusNotFound, "You say: Marco! \n Your item: Polo?")
			} else {
				deploys := secret_list.Data["keys"].([]interface{})
				context.JSON(http.StatusOK, gin.H{"deploy_list": deploys})
			}
			// for k := range deploys {
			// 	fmt.Fprintf(os.Stderr, "%+v\n", deploys[k])
			// }
		}
	}
}

func CreatClient() *vault.Client {
	config := &vault.Config{
		Address: os.Getenv("VAULT_ADDR"),
	}
	client, err := vault.NewClient(config)
	if err != nil {
		fmt.Fprintf(os.Stderr, "vault.NewClient(%+v): %+v\n", client, err)
		os.Exit(1)
	}
	client.SetToken(os.Getenv("VAULT_TOKEN"))
	// path := os.Getenv("VAULT_PREFIX")
	if config.Error != nil {
		fmt.Fprintf(os.Stderr, "config set up incorrect: %+v\n", config.Error)
		os.Exit(1)
	}
	return client
}
