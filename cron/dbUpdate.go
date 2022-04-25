package main

import (
	controller "cron/github"
	"database/sql"
	"fmt"
	"log"

	"os"

	vault "github.com/hashicorp/vault/api"
	_ "github.com/lib/pq"
)

func main() {
	CheckAndUpdateDeployments(LoadDeployments())
	log.Println("Database updated")
	controller.FetchAllKitInfo()
}

func LoadDeployments() map[string][]map[string]string {
	client := CreatClient()
	list_path := os.Getenv("VAULT_LIST_PREFIX")
	if list_path == "" {
		fmt.Fprintf(os.Stderr, "loadDeployment: empty prefix, please provide a valid prefix")
	}
	secret_list, err := client.Logical().List(list_path)
	if err != nil {
		fmt.Fprintf(os.Stderr, "client.Logical().List(%s): %+v\n", list_path, err)
	} else if secret_list == nil {
		fmt.Fprintf(os.Stderr, "client.Logical().List(%s): Secret List not found!\n", list_path)
	} else {
		deploys := secret_list.Data["keys"].([]interface{})
		deploys_map := make(map[string][]map[string]string)
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
				data_list := make([]map[string]string, 0)
				for _, kit := range kits {
					kits_map := make(map[string]string)
					kit_path := data_path + deploy.(string) + "/" + kit.(string)
					secret, err := client.Logical().Read(kit_path)
					if err != nil {
						fmt.Fprintf(os.Stderr, "client.Logical().Read(%s): %+v\n", kit_path, err)
					} else if secret == nil {
						fmt.Fprintf(os.Stderr, "client.Logical().Read(%s): Secret not found! at: %s\n", kit_path, kit_path)
					} else {
						data := secret.Data["data"].(map[string]interface{})
						kits_map["kit_name"] = kit.(string)
						keys := []string{"kit_is_dev", "dated", "deployer", "kit_version", "features"}
						for _, key := range keys {
							if val, ok := data[key]; ok {
								kits_map[key] = val.(string)
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

const (
	host     = "postgres"
	port     = 5432
	user     = "postgres"
	password = "postgres"
	dbname   = "genesis-ui"
)

func ConnectDB() *sql.DB {
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
		"password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)
	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		panic(err)
	}

	err = db.Ping()
	if err != nil {
		panic(err)
	}
	fmt.Println("Successfully connected!")
	return db
}

func CheckAndUpdateDeployments(deployment_details map[string][]map[string]string) string {
	// example structure for deployment_details
	// {
	// 	buffalo-lab/:{
	// 	dated:"2021-11-17 03:31:14 +0000",
	// 	deployer:"xiujiao",
	// 	features:"vsphere,proto,vault-credhub-proxy",
	// 	kit_is_dev:0,
	// 	kit_name:"bosh",
	// 	kit_version:"2.2.1"
	// 	}
	// }

	dbConn := ConnectDB()
	for deployment_name, element := range deployment_details {
		for index, kit_details := range element {
			fmt.Println("Processing index", index, "of deployment", deployment_name)
			var deployment_id int
			deployment_id = 0
			err := dbConn.QueryRow(fmt.Sprintf("SELECT CASE WHEN COUNT(*) > 0 THEN (SELECT id FROM deployment_details WHERE name = '%s') ELSE 0 END FROM deployment_details WHERE name = '%s'", deployment_name, deployment_name)).Scan(&deployment_id)
			if err != nil {
				return err.Error()
			}
			if deployment_id == 0 {
				err := dbConn.QueryRow(fmt.Sprintf("INSERT INTO deployment_details (name, recent_update_at) VALUES ('%s', now()) RETURNING id", deployment_name)).Scan(&deployment_id)
				if err != nil {
					return err.Error()
				}
			}
			if deployment_id > 0 {
				var kit_id int
				kit_id = 0
				is_dev := 0
				if kit_details["kit_is_dev"] != "0" {
					is_dev = 1
				}
				err := dbConn.QueryRow(fmt.Sprintf("SELECT CASE WHEN COUNT(*) > 0 THEN (SELECT id FROM kit_details WHERE name = '%s' and deployment_id = %d) ELSE 0 END FROM kit_details WHERE name = '%s' and deployment_id = %d", kit_details["kit_name"], deployment_id, kit_details["kit_name"], deployment_id)).Scan(&kit_id)
				if err != nil {
					return err.Error()
				}
				fmt.Println("kit id", kit_id)
				if kit_id == 0 {
					err := dbConn.QueryRow(fmt.Sprintf("INSERT INTO kit_details (name, version, deployment_id, deployed_by, deployed_at, features, is_dev, recent_update_at) VALUES ('%s', '%s', %d, '%s', '%s', '%s', %d, now()) RETURNING id", kit_details["kit_name"], kit_details["kit_version"], deployment_id, kit_details["deployer"], kit_details["dated"], kit_details["features"], is_dev)).Scan(&kit_id)
					if err != nil {
						return err.Error()
					}
				} else if kit_id > 0 {
					err := dbConn.QueryRow(fmt.Sprintf("UPDATE kit_details SET name='%s', version='%s', deployment_id=%d, deployed_by='%s', deployed_at='%s', features='%s', is_dev=%d, recent_update_at=now() WHERE deployment_id=%d and name = '%s'", kit_details["kit_name"], kit_details["kit_version"], deployment_id, kit_details["deployer"], kit_details["dated"], kit_details["features"], is_dev, deployment_id, kit_details["kit_name"]))
					if err != nil {
						return "invalid update"
					}
				}
			} else {
				return "Deployment not inserted"
			}
		}
	}
	dbConn.Close()
	return "Records imported successfully!"
}
