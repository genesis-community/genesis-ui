# syntax=docker/dockerfile:1
FROM golang:1-bullseye

WORKDIR /app

COPY . .

RUN go mod download
RUN go build -o ./genesis-backend

EXPOSE 8000

CMD [ "./genesis-backend" ]