FROM golang:1.17 AS build

WORKDIR /cronjob
COPY cron/go.mod ./
COPY cron/go.sum ./
RUN go mod download

COPY cron/dbUpdate.go dbUpdate.go
RUN go build -o /db-update dbUpdate.go


FROM ubuntu:20.04
RUN apt-get update && apt-get install -y cron
# Runs db update every minute
# Change first * to 0 for every hour
RUN echo "* * * * * /bin/sh; /db-update 2>> /var/log/cron.log" > /etc/cron.d/vault-pg-importer.cron
RUN chmod 0644 /etc/cron.d/vault-pg-importer.cron
RUN crontab /etc/cron.d/vault-pg-importer.cron
RUN touch /var/log/cron.log
COPY --from=build /db-update /db-update

CMD printenv >> /etc/environment ; cron -f -l 2