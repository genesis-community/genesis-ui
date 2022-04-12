# Used to launch frontend, backend, and database
all: stop build up

build:
	./bin/docker compose-build

up:
	./bin/docker compose-up

stop:
	./bin/docker compose-stop