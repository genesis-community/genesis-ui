package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strconv"

	vault "github.com/hashicorp/vault/api"
	_ "github.com/lib/pq"
	"github.com/blockloop/scan"
	"cron/github"
)
type Kit struct{
	Id            int64  `db:id`
	Name          string `db:"name"`
	Version       string `db:"version"`
	Deployment_id int64  `db:"deployment_id"`
	Deployed_at   string `db:"deployed_at"`
	Features      string `db:"features"`
	Is_Dev        int64  `db:"is_dev"`    
}
func main() {
	CheckAndUpdateDeployments(LoadDeployments())
	log.Println("Database updated")
	// Fetch kit details from GitHub Repo
	kits:=github.FetchAllKitInfo()
	fmt.Println("kit details fetched from repo")
	//update the github_deployment_deatils DB table with details feteched from github
	outstr:=CheckAndUpdateGitHubDeployments(kits)
	fmt.Println(outstr)
	//compare the kit details from the vault table with github kit detail DB 
	fmt.Println(CompareAndUpdateDeployments())
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

//Function to update the deployment_details_github DB table with the kit details fetched from GitHub
func CheckAndUpdateGitHubDeployments(kits map[string][]map[string]string) (string){
	// example structure for kits
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
    
	dbConn:=ConnectDB()
	for deployment_name,deployment:=range kits{
		deployment_name=deployment_name+"/"
		for index,kit_details :=range deployment{
			kit_name:=kit_details["kit_name"]
			fmt.Println("Processing Index",index , "kit" ,kit_name, "of deployment", deployment_name)
			var deployment_id int
			deployment_id = 0
			err := dbConn.QueryRow(fmt.Sprintf("SELECT CASE WHEN COUNT(*) > 0 THEN (SELECT id FROM deployment_details WHERE name = '%s') ELSE 0 END FROM deployment_details WHERE name = '%s'", deployment_name, deployment_name)).Scan(&deployment_id)
			if err != nil {
				return err.Error()
			}
			if deployment_id == 0 {
				
				fmt.Println("Deployment ",deployment_name,"does not exist in Genesis UI database")
				break;
			}
			if deployment_id > 0 {
				var kit_id int
				kit_id = 0
				is_dev := 0
				if kit_details["kit_is_dev"] != "0" {
					is_dev = 1
				}
				err := dbConn.QueryRow(fmt.Sprintf("SELECT CASE WHEN COUNT(*) > 0 THEN (SELECT id FROM deployment_details_github WHERE kit_name = '%s' and deployment_id = %d) ELSE 0 END FROM deployment_details_github WHERE kit_name = '%s' and deployment_id = %d", kit_name, deployment_id, kit_name, deployment_id)).Scan(&kit_id)
				if err != nil {
					return err.Error()
				}
				fmt.Println("kit id", kit_id)
				if kit_id == 0 {
					err := dbConn.QueryRow(fmt.Sprintf("INSERT INTO deployment_details_github (deployment_name,kit_name, version, deployment_id, deployed_by, deployed_at, features, is_dev, recent_update_at) VALUES ('%s','%s', '%s', %d, '%s', '%s', '%s', %d, now()) RETURNING id",deployment_name,kit_name, kit_details["kit_version"], deployment_id, kit_details["deployer"], kit_details["dated"], kit_details["features"], is_dev)).Scan(&kit_id)
					if err != nil {
						return err.Error()
					}
				} else if kit_id > 0 {
					err := dbConn.QueryRow(fmt.Sprintf("UPDATE deployment_details_github SET  version='%s', deployment_id=%d, deployed_by='%s', deployed_at='%s', features='%s', is_dev=%d, recent_update_at=now() WHERE deployment_id=%d and kit_name = '%s' RETURNING id",  kit_details["kit_version"], deployment_id, kit_details["deployer"], kit_details["dated"], kit_details["features"], is_dev, deployment_id, kit_name)).Scan(&kit_id)
					if err != nil {
						return err.Error()
					}
				}
			} else {
				return "Deployment details not inserted from github"
			}
		}

	}
    dbConn.Close()
	return "Records imported successfully from github repo !"


}

//Function to compare the kit details between vault DB table and GitHub DB table
func CompareAndUpdateDeployments() (string){

	
	dbConn:=ConnectDB()
	var kits []Kit
	rows,err:=dbConn.Query(fmt.Sprintf("SELECT id,name, version, deployment_id, deployed_at, features, is_dev FROM kit_details"))
	if err!=nil{
		return err.Error()
	}
	defer rows.Close()
	sc:=scan.Rows(&kits,rows)
	if sc!=nil{
		return sc.Error()
	}
    for index,item:=range kits{
		fmt.Println(item)
		fmt.Println("Comparing Kit index",index)
		res,msg:=CompareKitDetails(dbConn,item)
		if res{
			err := dbConn.QueryRow(fmt.Sprintf("UPDATE kit_details SET sync_with_github='%t' WHERE id='%s'", res, kitId))
			if err != nil {
				log.Println("invalid update for kit id",kitId)
			}

		}else{
			log.Println("Deployment not in sync/comparison failed with message",msg)
			err := dbConn.QueryRow(fmt.Sprintf("UPDATE kit_details SET sync_with_github='%t' WHERE id='%s'", res, kitId))
			if err != nil {
				log.Println("invalid update for kit id",kitId)
			}
		}
		
	}
    
	return "Deployment Comparison job completed"



}

func CompareKitDetails(dbConn *sql.DB,kit Kit)(bool,string){

	var kit_id int
    err := dbConn.QueryRow(fmt.Sprintf("SELECT CASE WHEN COUNT(*) > 0 THEN (SELECT id FROM deployment_details_github WHERE kit_name = '%s' and deployment_id = %d) ELSE 0 END FROM deployment_details_github WHERE kit_name = '%s' and deployment_id = %d", kit.Name, kit.Deployment_id, kit.Name, kit.Deployment_id)).Scan(&kit_id)
	if err != nil {
		return false,err.Error()
	}
	fmt.Println("kit id", kit_id)
	if kit_id == 0 {
		return false,"Kit doesn't exist in GitHub"
	}else{
		var(
			git_kit_version string
			git_deployed_at string
			git_kit_features string
		)
		err:=dbConn.QueryRow(fmt.Sprintf("SELECT version,  deployed_at, features, FROM deployment_details_github WHERE deployment_id=%d and kit_name = '%s'",kit.Deployment_id, kit.Name)).Scan(&git_kit_version,&git_deployed_at,&git_kit_features)
		if err!=nil{
			return false,err.Error()
		}

		//compare the kit version ,deployment date and features 

		if (kit.Version==git_kit_version) && (kit.Deployed_at==git_deployed_at)&&(kit.Features==git_kit_features){
			return true,"Kit Details Matches"
		}else{
			return false,"Kit Details doesn't match:"+"Kit Version match:"+strconv.FormatBool(kit.Version==git_kit_version)+",Kit Deployment date match:"+strconv.FormatBool(kit.Deployed_at==git_deployed_at)+",Kit Deployment features match:"+strconv.FormatBool(kit.Features==git_kit_features)
		}




	}
}