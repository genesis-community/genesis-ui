# syntax=docker/dockerfile:1
FROM golang:1.17

WORKDIR /app
COPY go.mod .
COPY go.sum .
RUN go mod download

COPY . .

RUN go build -o ./genesis-backend

EXPOSE 8000

CMD [ "./genesis-backend" ]