package configs

import (
	"database/sql"
	"fmt"
	"strings"

	_ "github.com/lib/pq"
)

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

func InsertRecords(dbConn *sql.DB, userDetails map[string]string) (string, bool) {

	var existingUser bool
	err := dbConn.QueryRow(fmt.Sprintf("SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END FROM user_details WHERE username = '%s'", userDetails["username"])).Scan(&existingUser)
	if err != nil {
		return err.Error(), false
	}
	if !existingUser {
		if userDetails["email"] == "" {
			sqlStatement := `INSERT INTO user_details (username, name, email, gittoken, key, recent_login_at) VALUES ($1, $2, null, $3, $4, now())`
			_, err = dbConn.Exec(sqlStatement, userDetails["username"], userDetails["name"], userDetails["gittoken"], userDetails["key"])
		} else {
			sqlStatement := `INSERT INTO user_details (username, name, email, gittoken, key, recent_login_at) VALUES ($1, $2, $3, $4, $5, now())`
			_, err = dbConn.Exec(sqlStatement, userDetails["username"], userDetails["name"], userDetails["email"], userDetails["gittoken"], userDetails["key"])
		}
		if err != nil {
			return err.Error(), false
		}
	} else {
		sqlStatement := `UPDATE user_details SET recent_login_at = now(), key = $1 WHERE username = $2`
		_, err = dbConn.Exec(sqlStatement, userDetails["key"], userDetails["username"])
		if err != nil {
			return err.Error(), false
		}
	}
	dbConn.Close()
	return "true", existingUser
}

func LogoutDB(dbConn *sql.DB, key string) string {
	var resultSet *sql.Row
	err := dbConn.QueryRow(fmt.Sprintf("UPDATE user_details SET key = null WHERE key = '%s'", key)).Scan(&resultSet)
	if err != nil && err.Error() != "sql: no rows in result set" {
		return err.Error()
	}
	dbConn.Close()
	return "true"
}

func GetUserDetailsDB(dbConn *sql.DB, key string) (bool, map[string]string) {
	var(
		accessToken string
		name string
		username string
	)
	//var accessToken string
	userDetails:=make(map[string]string)
	err := dbConn.QueryRow(fmt.Sprintf("SELECT username,name,gittoken FROM user_details WHERE key = '%s'", key)).Scan(&username,&name,&accessToken)
	if err != nil {
		return false, nil
	}
	dbConn.Close()
	userDetails["accessToken"]=accessToken
	userDetails["name"]=name
	userDetails["username"]=username
	return true, userDetails
}

/*
AddQuickView will add quickview 
to the table quickviews and will create 
records into table quickviews_values for each quickview type for each user 
*/
func AddQuickView(dbConn *sql.DB,quickviewName string,quickview_info map[string][]string,userDetails map[string]string)(string,bool){
	if quickviewName!="" && len(quickview_info)>0 {
		
		deployment_fltrs:=quickview_info["deployments"]
		kitname_fltrs:=quickview_info["kitname"]
		
        var quickview_id int
		err := dbConn.QueryRow(fmt.Sprintf("INSERT INTO quickviews (user_name,name,created_at) VALUES ('%s', '%s',now()) RETURNING id", userDetails["username"],quickviewName)).Scan(&quickview_id)
				if err != nil {
					return err.Error(),false
				}
		if(quickview_id>0){


			if(len(deployment_fltrs)>0){
				
				deployments:=strings.Trim(strings.Join(strings.Fields(fmt.Sprint(deployment_fltrs)), ", "), "[]")
				sqlStatement:=`INSERT INTO quickviews_values(quickview_id,qv_value,qv_value_type,created_at) VALUES ($1,$2,$3,now())`
				_, err=dbConn.Exec(sqlStatement,quickview_id,deployments,"deployments")
				if err !=nil{
					return err.Error(),false
				}
			}

			if(len(kitname_fltrs)>0){
				
				kitnames:=strings.Trim(strings.Join(strings.Fields(fmt.Sprint(kitname_fltrs)), ", "), "[]")
				sqlStatement:=`INSERT INTO quickviews_values(quickview_id,qv_value,qv_value_type,created_at) VALUES ($1,$2,$3,now())`
				_, err=dbConn.Exec(sqlStatement,quickview_id,kitnames,"kitname")
				if err !=nil{
					return err.Error(),false
				}

			}
	    }

		return "Quickview added",true



	} else{
		return "Quickview creation failed",false
	}
}

/*
GetUserQuickViews will give the list of quickviews available for 
each user from the database
*/

func GetUserQuickViews(dbConn *sql.DB,userDetails map[string]string) (bool,map[string]map[string][]string,error){
	quickviews:=make(map[string]map[string][]string)
	username:=userDetails["username"]
	if username !=""{
        rows,err:=dbConn.Query(fmt.Sprintf("SELECT id,name FROM quickviews WHERE user_name='%s'",username))
		if err!=nil{
			return false,nil,err
		}
		fmt.Println(rows)
		defer rows.Close()
		for rows.Next(){
			var(
				qv_name string
			    qv_id string
			)
			if err :=rows.Scan(&qv_id,&qv_name);err!=nil{
				return false,nil,err
			}
			qv,err:=dbConn.Query(fmt.Sprintf("SELECT qv_value_type,qv_value FROM quickviews_values WHERE quickview_id='%s'",qv_id))
			if err!=nil{
				return false,nil,err
			}
			defer qv.Close()
			qvtype:=make(map[string][]string)
			for qv.Next(){
				var(
					qvt string
					values string
				)
				if err:=qv.Scan(&qvt,&values);err!=nil{
					return false,nil,err
				}
				qvtype[qvt]=strings.Split(values,",")
			}
			if err=qv.Err();err!=nil{
				return false,nil,err
			}
			quickviews[qv_name]=qvtype
		}
		if err=rows.Err();err!=nil{
			return false,nil,err
		}
		return true,quickviews,nil
	}else{
		return false,nil,nil
	}


}
/*ListDeployment function to get all available deployments 
from the local Database*/
func ListDeployments(dbConn *sql.DB) (bool,[]string){
	
	var deployment_list []string
	rows,err:=dbConn.Query(fmt.Sprintf("SELECT name from deployment_details"))
			if err!=nil{
				return false,nil
			}
			defer rows.Close()
			for rows.Next(){
				var deployment_name string
				if err :=rows.Scan(&deployment_name);err!=nil{
					return false,nil
				}
				deployment_list=append(deployment_list,deployment_name)
			}
			if err=rows.Err();err!=nil{
				return false,nil
			}
	dbConn.Close()
	return true,deployment_list
			
	

}
/*GetDeploymentDetails function to get the kit information 
for a given deployment deployment */
func GetDeploymentDetails(dbConn *sql.DB,deployment_name string)(bool,map[string]interface{}){
	deployment_details:=make(map[string]interface{})
	var deployment_id int
	err:=dbConn.QueryRow(fmt.Sprintf("SELECT id FROM deployment_details WHERE name= '%s'",deployment_name)).Scan(&deployment_id)
	if err != nil {
		return false,nil
	}
	if deployment_id>0{
		rows,err:=dbConn.Query(fmt.Sprintf("SELECT name,version,is_dev,features,deployed_by,deployed_at from kit_details WHERE deployment_id='%d'",deployment_id))
				if err!=nil{
					return false,nil
				}
				defer rows.Close()
					for rows.Next(){
						kit:=make(map[string]string)
						var(
							kit_name string
							kit_version string
							kit_is_dev string
							features string
							deployer string
							dated string
						)
						if err:=rows.Scan(&kit_name,&kit_version,&kit_is_dev,&features,&deployer,&dated);err!=nil{
							return false,nil
						}
						kit["kit_name"]=kit_name
						kit["kit_version"]=kit_version
						kit["kit_is_dev"]=kit_is_dev
						kit["features"]=features
						kit["deployer"]=deployer
						kit["dated"]=dated
						deployment_details[kit_name]=kit
					}
					if err=rows.Err();err!=nil{
						return false,nil
					}
			dbConn.Close()
			return true,deployment_details

				
	}else{
		return false,nil
	}
}

