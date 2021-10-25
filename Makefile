all: docker-build docker-run

rm-all: docker-rm-container docker-rm-img

docker-build:
	echo "Building Genesis UI image from Dockerfile."
	docker build -t genesis-ui .
	echo "Genesis UI image is ready."

docker-run:
	echo "Preparing Genesis UI in container."
	docker container run --name genesis-ui --publish 3000:3000 --detach genesis-ui
	echo "Container up and runing."

docker-start:
	echo "Starting Up Genesis UI."
	docker container start genesis-ui
	echo "Container up and runing."

docker-stop:
	echo "Stoping Genesis UI Container."
	docker container stop genesis-ui
	echo "Genesis UI Container Stopped."

docker-rm-img:
	echo "Removing image."
	docker image rm genesis-ui
	echo "Image removed."

docker-rm-container:
	echo "Remving container."
	docker container stop genesis-ui
	docker container rm genesis-ui
	echo "Container removed."