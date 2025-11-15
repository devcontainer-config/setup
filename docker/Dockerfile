FROM --platform=linux/amd64 gcr.io/distroless/nodejs24-debian12 AS linux-amd64-base
FROM --platform=linux/arm64 gcr.io/distroless/nodejs24-debian12 AS linux-arm64-base

ARG TARGETOS
ARG TARGETARCH
FROM ${TARGETOS}-${TARGETARCH}-base

COPY package/ /etc/devcontainer-config-setup

ENTRYPOINT [ "/nodejs/bin/node", "/etc/devcontainer-config-setup/index.js" ]
