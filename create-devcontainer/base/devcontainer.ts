import dedent from "dedent";
import semver from "semver";

import { stringify } from "../formatting.js";
import type { Config } from "../types.js";
import { getNodeLtsVersions } from "../versions/node.js";
import { getNpmPackageDistTags } from "../versions/npm.js";
import { getOciArtifactMaxMajorVersion, getOciArtifactTags } from "../versions/oci.js";

export interface BaseDevcontainerConfigs extends Config {
  ".devcontainer/.env": string[];
  ".devcontainer/devcontainer.json": string;
  ".devcontainer/docker-compose.yml": string;
  ".devcontainer/Dockerfile": string[];
  ".devcontainer/dot-config.json": string;
}

const getPnpmLatestDistTag = async () => {
  const distTags = await getNpmPackageDistTags("pnpm");
  const latestVersion = Object.keys(distTags)
    .filter((tag) => tag.startsWith("latest-"))
    .map((tag) => tag.slice("latest-".length))
    .map((tag) => semver.coerce(tag)?.major)
    .flatMap((major) => (major ? major : []))
    .toSorted()
    .toReversed()
    .at(0)
    ?.toString();
  return latestVersion ? `latest-${latestVersion}` : "latest";
};

export const createBaseDevcontainerConfigs = async (
  projectName: string,
  remoteUser = "dev",
): Promise<BaseDevcontainerConfigs> => {
  const userInitRepoName = "ghcr.io/devcontainer-config/features/user-init";
  const dotConfigRepoName = "ghcr.io/devcontainer-config/features/dot-config";
  const userInitVersion = await getOciArtifactMaxMajorVersion(userInitRepoName);
  const dotConfigVersion = await getOciArtifactMaxMajorVersion(dotConfigRepoName);

  const nodeDevcontainerRepoName = "mcr.microsoft.com/devcontainers/javascript-node";
  const nodeLtsVersions = await getNodeLtsVersions();
  const nodeDevcontainerTags = new Set(await getOciArtifactTags(nodeDevcontainerRepoName));
  const nodeDevcontainerVersion =
    nodeLtsVersions.find((v) => nodeDevcontainerTags.has(v.toString()))?.toString() ?? "latest";

  const pnpmVersion = await getPnpmLatestDistTag();
  return {
    ".devcontainer/.env": [
      dedent`
        COMPOSE_PROJECT_NAME=${projectName}
        WORKSPACES=/workspaces
        XDG_CONFIG_HOME=/home/${remoteUser}/.config
        XDG_CACHE_HOME=/home/${remoteUser}/.cache
        XDG_DATA_HOME=/home/${remoteUser}/.local/share
        XDG_STATE_HOME=/home/${remoteUser}/.local/state
        XDG_DATA_DIRS=/usr/local/share:/usr/share
        XDG_CONFIG_DIRS=/etc/xdg
        `,
    ],
    ".devcontainer/devcontainer.json": dedent`
      {
        "name": "${projectName}",
        "dockerComposeFile": "docker-compose.yml",
        "service": "devcontainer",
        "overrideCommand": true,
        "remoteUser": "${remoteUser}",
        "workspaceFolder": "/workspaces/${projectName}",
        "features": {
          "${userInitRepoName}:${userInitVersion}": {},
          "${dotConfigRepoName}:${dotConfigVersion}": {}
        },
        "customizations": {
          "vscode": {
            // spell-checker:ignore esbenp azuretools
            "extensions": [
              "esbenp.prettier-vscode",
              "ms-azuretools.vscode-docker",
              "streetsidesoftware.code-spell-checker"
            ],
            "settings": {
              "files.associations": {
                "ignore": "ignore",
                "attributes": "properties",
                "rc": "properties"
              },
              "editor.formatOnSave": true,
              "editor.defaultFormatter": "esbenp.prettier-vscode",
              "[dockerfile]": {
                "editor.defaultFormatter": "ms-azuretools.vscode-docker"
              },
              "cSpell.autoFormatConfigFile": true,
              "cSpell.checkOnlyEnabledFileTypes": false
            }
          }
        },
        "onCreateCommand": "pnpm install"
      }
      `,
    ".devcontainer/docker-compose.yml": dedent`
      services:
        devcontainer:
          env_file:
            - .env
          build:
            context: .
            dockerfile: Dockerfile
            args:
              - WORKSPACES=\${WORKSPACES}
              - COMPOSE_PROJECT_NAME=\${COMPOSE_PROJECT_NAME}
          init: true
          volumes:
            - WORKSPACES:\${WORKSPACES}
            - ..:\${WORKSPACES}/\${COMPOSE_PROJECT_NAME}
            - XDG_CONFIG_HOME:\${XDG_CONFIG_HOME}
            - XDG_CACHE_HOME:\${XDG_CACHE_HOME}
            - XDG_DATA_HOME:\${XDG_DATA_HOME}
            - XDG_STATE_HOME:\${XDG_STATE_HOME}
            - node_modules:\${WORKSPACES}/\${COMPOSE_PROJECT_NAME}/node_modules
            - node_modules:\${WORKSPACES}/node_modules
      volumes:
        WORKSPACES:
        XDG_CONFIG_HOME:
        XDG_CACHE_HOME:
        XDG_DATA_HOME:
        XDG_STATE_HOME:
        node_modules:
      `,
    ".devcontainer/Dockerfile": [
      dedent`
        FROM ${nodeDevcontainerRepoName}:${nodeDevcontainerVersion}
        ARG WORKSPACES
        ARG COMPOSE_PROJECT_NAME
        `,
      dedent(`
        RUN NODE_MODULES_PATH=\${WORKSPACES}/\${COMPOSE_PROJECT_NAME}/node_modules && \\
            mkdir --parents \${NODE_MODULES_PATH} && \\
            chown $(id --user --name 1000): \${NODE_MODULES_PATH}
        `),
      dedent`
        RUN npm install --global pnpm@${pnpmVersion}
        `,
    ],
    ".devcontainer/dot-config.json": stringify({
      git: {
        attributes: `/home/${remoteUser}/.config/git/attributes`,
        ignore: `/home/${remoteUser}/.config/git/ignore`,
      },
      cspell: {
        "cspell.json": "cspell.json",
      },
      pnpm: {
        rc: `/home/${remoteUser}/.config/pnpm/rc`,
      },
      prettier: {
        ".prettierrc.json": ".prettierrc.json",
      },
      workspaces: {
        "../git/attributes": ".gitattributes",
        "../git/ignore": ".gitignore",
        "package.json": "package.json",
      },
    }),
  };
};
