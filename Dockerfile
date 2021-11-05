FROM golang:1.17.2

# Set environment to current environment
ENV HOME ./

#make app directory
RUN mkdir -p /app

# cd into home directory
WORKDIR /app

# copy both go.mod and og.sum
# COPY go.mod ./
# COPY go.sum ./

# copy all files
# COPY . ./
COPY go.mod /app
COPY go.sum /app
COPY login.html /app
COPY *.go /app
COPY assets /app/assets
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