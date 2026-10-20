ARG BASE_IMAGE=credonomics-youpi-private:phase29
FROM ${BASE_IMAGE}
COPY --chown=node:node gateway/ /app/
