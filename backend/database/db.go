package configs

import (
	"database/sql"
	"fmt"

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

func GetUserDetailsDB(dbConn *sql.DB, key string) (string, string) {
	var accessToken string
	err := dbConn.QueryRow(fmt.Sprintf("SELECT gittoken FROM user_details WHERE key = '%s'", key)).Scan(&accessToken)
	if err != nil {
		return "false", err.Error()
	}
	dbConn.Close()
	return "true", accessToken
}
