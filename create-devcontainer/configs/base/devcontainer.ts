import semver from "semver";

import { fillTemplate } from "../../formatting.js";
import { getNodeLtsVersions } from "../../versions/node.js";
import { getNpmPackageDistTags } from "../../versions/npm.js";
import { getOciArtifactMaxMajorVersion, getOciArtifactTags } from "../../versions/oci.js";
import { loadTemplates } from "../templates.js";

export interface BaseDevcontainerConfigs {
  ".devcontainer/.env": string;
  ".devcontainer/devcontainer.json": string;
  ".devcontainer/docker-compose.yml": string;
  ".devcontainer/Dockerfile": string;
  ".devcontainer/dot-config.json": string;
}

const getPnpmLatestDistTag = async () => {
  const distTags = await getNpmPackageDistTags("pnpm");
  const latestVersion = Object.keys(distTags)
    .filter((tag) => tag.startsWith("latest-"))
    .map((tag) => tag.slice("latest-".length))
    .map((tag) => semver.coerce(tag)?.major)
    .flatMap((major) => (major ? major : []))
    .toSorted((a, b) => b - a)
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
  const nodeVersion = nodeLtsVersions.find((v) => nodeDevcontainerTags.has(v.toString()))?.toString() ?? "latest";

  const templates = await loadTemplates("base", [
    ".devcontainer/.env",
    ".devcontainer/devcontainer.json",
    ".devcontainer/docker-compose.yml",
    ".devcontainer/Dockerfile",
    ".devcontainer/dot-config.json",
  ] satisfies (keyof BaseDevcontainerConfigs)[]);

  const pnpmVersion = await getPnpmLatestDistTag();
  return {
    ".devcontainer/.env": fillTemplate(templates[".devcontainer/.env"], { projectName, remoteUser }),
    ".devcontainer/devcontainer.json": fillTemplate(templates[".devcontainer/devcontainer.json"], {
      projectName,
      remoteUser,
    })
      .replaceAll(userInitRepoName, `${userInitRepoName}:${userInitVersion}`)
      .replaceAll(dotConfigRepoName, `${dotConfigRepoName}:${dotConfigVersion}`),
    ".devcontainer/docker-compose.yml": templates[".devcontainer/docker-compose.yml"],
    ".devcontainer/Dockerfile": fillTemplate(templates[".devcontainer/Dockerfile"], { nodeVersion, pnpmVersion }),
    ".devcontainer/dot-config.json": fillTemplate(templates[".devcontainer/dot-config.json"], { remoteUser }),
  };
};
