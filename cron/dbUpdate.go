package main

import (
	"fmt"
	"log"
	"os"

	vault "github.com/hashicorp/vault/api"
)

func main() {
	vault_deploys := LoadDeployments()
	log.Println("deployment example: map[\"deployname\":[ map[\"kit_name\"]:\"kit_name\" ]")
	log.Println("buffalo-lab:", vault_deploys["buffalo-lab/"])
	log.Println("Writing log")
}

func LoadDeployments() map[string][]map[string]interface{} {
	client := CreatClient()
	list_path := os.Getenv("VAULT_LIST_PREFIX")
	if list_path == "" {
		fmt.Fprintf(os.Stderr, "loadDeployment: empty perfix, please provide a valid prefix")
	}
	secret_list, err := client.Logical().List(list_path)
	if err != nil {
		fmt.Fprintf(os.Stderr, "client.Logical().List(%s): %+v\n", list_path, err)
	} else if secret_list == nil {
		fmt.Fprintf(os.Stderr, "client.Logical().List(%s): Secret List not found!\n", list_path)
	} else {
		deploys := secret_list.Data["keys"].([]interface{})
		deploys_map := make(map[string][]map[string]interface{})
		for _, deploy := range deploys {
			directory := list_path + "/" + deploy.(string)
			kit_list, err := client.Logical().List(directory)
			if err != nil {
				fmt.Fprintf(os.Stderr, "client.Logical().List(%s): %+v\n", directory, err)
			} else if kit_list == nil {
				fmt.Fprintf(os.Stderr, "client.Logical().List(%s): Secret List not found!\n", directory)
			} else {
				kits := kit_list.Data["keys"].([]interface{})
				data_path := os.Getenv("VAULT_DATA_PREFIX")
				data_list := make([]map[string]interface{}, 0)
				for _, kit := range kits {
					kits_map := make(map[string]interface{})
					kit_path := data_path + deploy.(string) + "/" + kit.(string)
					secret, err := client.Logical().Read(kit_path)
					if err != nil {
						fmt.Fprintf(os.Stderr, "client.Logical().Read(%s): %+v\n", kit_path, err)
					} else if secret == nil {
						fmt.Fprintf(os.Stderr, "client.Logical().Read(%s): Secret not found! at: %s\n", kit_path, kit_path)
					} else {
						data := secret.Data["data"].(map[string]interface{})
						kits_map["kit_name"] = kit
						keys := []string{"kit_is_dev", "dated", "deployer", "kit_version", "features"}
						for _, key := range keys {
							if val, ok := data[key]; ok {
								kits_map[key] = val
							} else {
								kits_map[key] = "N/A"
							}
						}
						data_list = append(data_list, kits_map)
					}
					deploys_map[deploy.(string)] = data_list
				}
			}
		}
		return deploys_map
	}
	return nil
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
