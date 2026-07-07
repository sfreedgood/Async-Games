# syntax=docker/dockerfile:1.7

# Stage to handle conditional env file copying
FROM alpine:latest AS envfile
ARG DB_ENV_FILE=.env.development
ARG DB_NAME=async_games
ARG DB_USERNAME=async_games_dev
ARG DB_PASSWORD=change_me
ARG DB_HOST=localhost
ARG DB_PORT=5432

WORKDIR /build
# Copy any .env files that exist
COPY .env* ./envfiles/
# Create the env file from source or build args
RUN if [ -f "envfiles/${DB_ENV_FILE##*/}" ]; then \
      cp "envfiles/${DB_ENV_FILE##*/}" /db_env; \
      echo "Using provided env file:${DB_ENV_FILE##*/}"; \
    else \
      echo "DB_HOST=${DB_HOST}" > /db_env; \
      echo "DB_PORT=${DB_PORT}" >> /db_env; \
      echo "DB_NAME=${DB_NAME}" >> /db_env; \
      echo "DB_USERNAME=${DB_USERNAME}" >> /db_env; \
      echo "DB_PASSWORD=${DB_PASSWORD}" >> /db_env; \
      echo "DB_LOGGING=false" >> /db_env; \
      echo "DB_SSL=false" >> /db_env; \
      echo "DB_SYNCHRONIZE=true" >> /db_env; \
      echo "Generated env file from build args"; \
    fi

# Final postgres image
FROM postgres:16-alpine

ARG POSTGRES_USER=postgres
ARG POSTGRES_PASSWORD=postgres

ENV POSTGRES_USER=${POSTGRES_USER}
ENV POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
ENV DB_ENV_PATH=/docker-entrypoint-initdb.d/.db_env

COPY --from=envfile /db_env ${DB_ENV_PATH}
COPY docker/db/init-db.sh /docker-entrypoint-initdb.d/10-init-app-db.sh

# initdb.d runs as the postgres user. COPY leaves these root-owned, so a bare
# `chmod 600` makes the env file unreadable AND the script non-executable for
# postgres — initdb silently sources nothing and the app role/db are never
# created. Hand ownership to postgres: keep the secret env file at 600 (still
# readable by its owner) and make the script executable.
RUN chown postgres:postgres ${DB_ENV_PATH} /docker-entrypoint-initdb.d/10-init-app-db.sh \
 && chmod 600 ${DB_ENV_PATH} \
 && chmod 755 /docker-entrypoint-initdb.d/10-init-app-db.sh