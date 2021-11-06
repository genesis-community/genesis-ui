all: stop build run

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

