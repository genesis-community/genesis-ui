package controllers

import (
	"fmt"
	"net/http"
	"os"
	"github.com/gin-gonic/gin"
	vault "github.com/hashicorp/vault/api"

)

func LoadDeployments() gin.HandlerFunc {
	return func(context *gin.Context) {
		config := &vault.Config{
			Address: os.Getenv("VAULT_ADDR"),
		} // modify for more granular configuration

		client, err := vault.NewClient(config)
		if err != nil {
			fmt.Fprintf(os.Stderr, "vault.NewClient(%+v): %+v\n", client, err)
			return
		}
		client.SetToken(os.Getenv("VAULT_TOKEN"))
		path := os.Getenv("VAULT_PREFIX")
		if config.Error != nil {
			fmt.Fprintf(os.Stderr, "config set up incorrect: %+v\n", config.Error)
			return
		}

		director := "snw-" + account_map["cookie/token"] + "-lab" // TODO: How to pass this in as an option / parameter

		secret, err := client.Logical().Read(path + director + "/bosh")
		if err != nil {
			fmt.Fprintf(os.Stderr, "client.Logical().Read(%s): %+v\n", path+director+"/bosh", err)
			return
		}
		if secret == nil {
			fmt.Fprintf(os.Stderr, "client.Logical().Read(%s): Secret not found!\n", path+director+"/bosh")
			return
		}

		data := secret.Data["data"].(map[string]interface{})

		// Debugging, see what's in there :)
		//for k,v := range data{
		//	fmt.Fprintf(os.Stderr, "%s: %+v\n", k, v)
		//}

		bosh_name := data["bosh"].(string)
		deploy_date := data["bosh-deployment-date"].(string)
		deployer_name := data["deployer"].(string)
		kit_name := data["kit_name"].(string)
		kit_version := data["kit_version"].(string)

		//context.SetCookie("name", "ABC", 10, "/bosh", "localhost", false, false)

		// commented out for new addition
		context.JSON(http.StatusOK, gin.H{"bosh_name": bosh_name, "deploy_date": deploy_date, "deployer_name": deployer_name, "kit_name": kit_name, "kit_version": kit_version})
		return
		// *************************
		// testing getting all deployments from inside buffalo-lab:
		// secret_lab, err := client.Logical().Read(path + "buffalo-lab" + "/bosh")
		// if err != nil {
		// 	fmt.Fprintf(os.Stderr, "client.Logical().Read(%s): %+v\n", path+director+"/bosh", err)
		// 	return
		// }
		// buf_lab_data := secret_lab.Data["data"].(map[string]interface{})

		// bosh_buf := buf_lab_data["bosh"].(string)
		// buf_kit_name := buf_lab_data["kit_name"].(string)
		// buf_kit_version := buf_lab_data["kit_version"].(string)

		// context.JSON(http.StatusOK, gin.H{"bosh_name": bosh_name, "deploy_date": deploy_date, "deployer_name": deployer_name, "kit_name": kit_name, "kit_version": kit_version, "bosh_buf": bosh_buf, "buf_kit_name": buf_kit_name, "buf_kit_version ": buf_kit_version})
		// end of testing
		// *************************

		// using cookie or token to look up evn/deployments
		// cookie, err := c.Cookie("gin_cookie")

		// if err != nil {
		//     cookie = "NotSet"
		//     c.SetCookie("gin_cookie", "test", 3600, "/", "localhost", false, true)
		// }
	}
}