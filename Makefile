# Used to launch frontend, backend, and database
all: compose-stop compose-build compose-up

# Used to launch just backend for frontend dev purposes
backend: stop build start

stop:
	./bin/docker stop

build:
	./bin/docker build

start:
	./bin/docker start

logs:
	./bin/docker logs

logs-tail:
	./bin/docker logs

web:
	./bin/docker web

compose-build:
	./bin/docker compose-build

compose-up:
	./bin/docker compose-up

compose-stop:
	./bin/docker compose-stop