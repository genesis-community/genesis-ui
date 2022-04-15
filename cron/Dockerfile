FROM ubuntu:latest
RUN apt-get update && apt-get -y install cron
COPY ./bin/vault-pg-importer /vault-pg-importer
RUN chmod +x /vault-pg-importer
RUN echo "0 * * * * /vault-pg-importer" > /etc/cron.d/pg-vault-importer.cron
RUN chmod 0644 /etc/cron.d/vault-pg-importer.cron
RUN crontab /etc/cron.d/vault-pg-importer.cron
RUN touch /var/log/cron.log
CMD ["cron","-f", "-l", "2"]