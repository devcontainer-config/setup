FROM mcr.microsoft.com/devcontainers/javascript-node:20
ARG WORKSPACES
ARG COMPOSE_PROJECT_NAME

RUN NODE_MODULES_PATH=${WORKSPACES}/${COMPOSE_PROJECT_NAME}/node_modules && \
    mkdir --parents ${NODE_MODULES_PATH} && \
    chown $(id --user --name 1000): ${NODE_MODULES_PATH}

RUN npm install --global pnpm@latest-9
