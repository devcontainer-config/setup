import type { CSpellUserSettings } from "cspell-lib";
import { spellCheckDocument } from "cspell-lib";
import * as jsonc from "jsonc-parser";
import semver from "semver";

import { fillTemplate } from "../../formatting.js";
import { getNodeLtsVersions } from "../../versions/node.js";
import { getNpmPackageDistTags } from "../../versions/npm.js";
import { getOciArtifactMaxMajorVersion, getOciArtifactTags } from "../../versions/oci.js";
import { loadTemplates } from "../templates.js";
import type { BaseDotConfigs } from "./dotConfig.js";

export interface BaseDevContainerConfigs {
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

export const createBaseDevContainerConfigs = async (
  projectName: string,
  remoteUser: string,
): Promise<BaseDevContainerConfigs> => {
  const templatePaths = [
    ".devcontainer/.env",
    ".devcontainer/devcontainer.json",
    ".devcontainer/docker-compose.yml",
    ".devcontainer/Dockerfile",
    ".devcontainer/dot-config.json",
  ] satisfies (keyof BaseDevContainerConfigs)[];
  const templates = await loadTemplates("base", [
    ...templatePaths,
    ".config/cspell/cspell.json" satisfies keyof BaseDotConfigs,
  ]);

  const devContainerConfig = await (async () => {
    const devContainerConfigPath = ".devcontainer/devcontainer.json" satisfies keyof BaseDevContainerConfigs;
    const devContainerConfig = jsonc.parse(
      fillTemplate(templates[devContainerConfigPath], { projectName, remoteUser }),
    ) as {
      features: object;
    };

    const userInitRepoName = "ghcr.io/devcontainer-config/features/user-init";
    const dotConfigRepoName = "ghcr.io/devcontainer-config/features/dot-config";
    const userInitVersion = await getOciArtifactMaxMajorVersion(userInitRepoName);
    const dotConfigVersion = await getOciArtifactMaxMajorVersion(dotConfigRepoName);
    devContainerConfig.features = {
      [`${userInitRepoName}:${userInitVersion}`]: {},
      [`${dotConfigRepoName}:${dotConfigVersion}`]: {},
    };

    const content = JSON.stringify(devContainerConfig);
    const spellCheckResult = await spellCheckDocument(
      { uri: devContainerConfigPath, text: content },
      { noConfigSearch: true },
      jsonc.parse(templates[".config/cspell/cspell.json"]) as CSpellUserSettings,
    );
    return [
      `// spell-checker:ignore ${[...new Set(spellCheckResult.issues.map((issue) => issue.text))].join(" ")}`,
      content,
    ].join("\n");
  })();

  const dockerFile = await (async () => {
    const nodeDevcontainerRepoName = "mcr.microsoft.com/devcontainers/javascript-node";
    const nodeLtsVersions = await getNodeLtsVersions();
    const nodeDevcontainerTags = new Set(await getOciArtifactTags(nodeDevcontainerRepoName));
    const nodeVersion = nodeLtsVersions.find((v) => nodeDevcontainerTags.has(v.toString()))?.toString() ?? "latest";
    const pnpmVersion = await getPnpmLatestDistTag();

    return fillTemplate(templates[".devcontainer/Dockerfile"], { nodeVersion, pnpmVersion });
  })();

  return {
    ".devcontainer/.env": fillTemplate(templates[".devcontainer/.env"], { projectName, remoteUser }),
    ".devcontainer/devcontainer.json": devContainerConfig,
    ".devcontainer/docker-compose.yml": templates[".devcontainer/docker-compose.yml"],
    ".devcontainer/Dockerfile": dockerFile,
    ".devcontainer/dot-config.json": fillTemplate(templates[".devcontainer/dot-config.json"], { remoteUser }),
  };
};
