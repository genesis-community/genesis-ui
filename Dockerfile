FROM golang:1.17 AS build

WORKDIR /cronjob
COPY cron/go.mod ./
RUN go mod download

COPY cron/dbUpdate.go dbUpdate.go
RUN go build -o /db-update dbUpdate.go


FROM ubuntu:latest
RUN apt-get update && apt-get -y install cron
COPY ./bin/vault-pg-importer /vault-pg-importer
RUN chmod +x /vault-pg-importer
RUN echo "* * * * * root /vault-pg-importer" > /etc/cron.d/vault-pg-importer.cron
RUN chmod 0644 /etc/cron.d/vault-pg-importer.cron
RUN crontab /etc/cron.d/vault-pg-importer.cron
RUN touch /var/log/cron.log
COPY --from=build /db-update /db-update

CMD ["cron","-f", "-l", "2"]