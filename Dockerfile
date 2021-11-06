# syntax=docker/dockerfile:1
FROM golang:1-bullseye

ENV HOME /app

WORKDIR /app

COPY go.mod /app
COPY go.sum /app
COPY *.go /app
COPY public /app/public

RUN go mod download
RUN go build -o ./genesis-ui

EXPOSE 3000

CMD [ "./genesis-ui" ]
