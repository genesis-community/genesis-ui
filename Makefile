# Used to launch frontend, backend, and database
all: stop build up

# Used to launch just backend for frontend dev purposes
backend: backend-stop backend-build backend-start

backend-stop:
	./bin/docker stop

backend-build:
	./bin/docker build

backend-start:
	./bin/docker start

backend-logs:
	./bin/docker logs

logs-tail:
	./bin/docker logs

web:
	./bin/docker web

build:
	./bin/docker compose-build

up:
	./bin/docker compose-up

stop:
	./bin/docker compose-stop