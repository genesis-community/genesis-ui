FROM golang:1.17.2

# Set environment to current environment
ENV HOME ./

# cd into home directory
WORKDIR /root

# copy both go.mod and og.sum
# COPY go.mod ./
# COPY go.sum ./

# copy all files
COPY . ./

# install all Go modules
RUN go mod download

# copy go source code
# COPY *.go ./

# build 
RUN go build -o ./genesis-ui

# expose port 3000 for external connection outside docker
EXPOSE 3000

#execute main.go
CMD [ "./genesis-ui" ]