ARG BASE_IMAGE=credonomics-youpi-private:pilot-v1
FROM ${BASE_IMAGE}
# Generated from the verified installed bridge by prepare-gateway-overlay.mjs.
COPY gateway-bridge.mjs /app/deploy/private/bridge.mjs
