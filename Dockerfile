FROM golang:1.17.2

# Set environment to current environment
ENV HOME ./

# cd into home directory
WORKDIR /root

# copy both go.mod and og.sum
COPY go.mod ./
COPY go.sum ./

# install all Go modules
RUN go mod download

# copy go source code
COPY *.go ./

# build 
RUN go build -o ./server.go

# expose port 8080 for external connection outside docker
EXPOSE 8080

#execute main.go
CMD [ "./server.go" ]