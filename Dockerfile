# syntax=docker/dockerfile:1
FROM golang:1-bullseye

ENV HOME /app

WORKDIR /app

# COPY go.mod /app
# COPY go.sum /app
# COPY server/ /app/
COPY public/ /app/public/
COPY server/ /app/server/

WORKDIR /app/server
RUN go mod download
RUN go build -o ./genesis-ui


EXPOSE 3000

CMD [ "./genesis-ui" ]