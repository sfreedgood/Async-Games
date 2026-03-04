# syntax=docker/dockerfile:1.7
FROM postgres:16-alpine

ARG DB_ENV_FILE=.env.development
ARG POSTGRES_USER=postgres
ARG POSTGRES_PASSWORD=postgres

ENV POSTGRES_USER=${POSTGRES_USER}
ENV POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
ENV DB_ENV_PATH=/docker-entrypoint-initdb.d/.db_env

COPY ${DB_ENV_FILE} ${DB_ENV_PATH}
COPY docker/db/init-db.sh /docker-entrypoint-initdb.d/10-init-app-db.sh

RUN chmod 600 ${DB_ENV_PATH} /docker-entrypoint-initdb.d/10-init-app-db.sh