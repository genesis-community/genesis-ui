package configs

import (
	"database/sql"
	"log"

	_ "github.com/lib/pq"
)

var connStr = "postgresql://postgres:postgres@172.18.0.3:5432/genesis-ui"

func ConnectDB() *sql.DB {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	return db
}
