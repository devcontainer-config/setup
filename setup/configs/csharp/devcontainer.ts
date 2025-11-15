import type { CSpellUserSettings } from "cspell-lib";
import { spellCheckDocument } from "cspell-lib";
import { defaultComposer } from "default-composer";
import * as jsonc from "jsonc-parser";

import { fillTemplate } from "../../formatting.js";
import { getDotNetCoreLatestLtsRelease } from "../../versions/dotnet.js";
import { getOciArtifactMaxMajorVersion } from "../../versions/oci.js";
import type { BaseDevContainerConfigs } from "../base/devcontainer.js";
import type { BaseConfigs } from "../base/index.js";
import { mergeArrayComposer, propertiesComposer } from "../composer.js";
import { loadTemplates } from "../templates.js";

export interface CSharpDevContainerConfigs {
  ".devcontainer/.env": string;
  ".devcontainer/devcontainer.json": string;
  ".devcontainer/Dockerfile": string;
  ".devcontainer/dot-config.json": string;
}

export const createCSharpDevContainerConfigs = async (
  baseConfig: BaseConfigs,
  remoteUser: string,
): Promise<CSharpDevContainerConfigs> => {
  const templatePaths = [
    ".devcontainer/.env",
    ".devcontainer/devcontainer.json",
    ".devcontainer/dot-config.json",
  ] satisfies (keyof CSharpDevContainerConfigs)[];
  const templates = await loadTemplates("csharp", [
    ...templatePaths,
    ".config/cspell/cspell.json" satisfies keyof BaseConfigs,
  ]);

  const devContainerConfig = await (async () => {
    const devContainerConfigPath = ".devcontainer/devcontainer.json" satisfies keyof BaseDevContainerConfigs;
    const devContainerConfig = jsonc.parse(templates[devContainerConfigPath]) as { features: object };

    const dotnetFeatureRepoName = "ghcr.io/devcontainers/features/dotnet";
    const dotnetFeatureVersion = await getOciArtifactMaxMajorVersion(dotnetFeatureRepoName);
    const { "channel-version": dotnetVersion } = await getDotNetCoreLatestLtsRelease();
    devContainerConfig.features = {
      [`${dotnetFeatureRepoName}:${dotnetFeatureVersion}`]: { version: dotnetVersion },
    };

    const mergedDevContainerConfig = mergeArrayComposer(
      jsonc.parse(baseConfig[devContainerConfigPath]) as object,
      devContainerConfig,
    );

    const content = JSON.stringify(mergedDevContainerConfig);
    const spellCheckResult = await spellCheckDocument(
      { uri: ".devcontainer/devcontainer.json", text: content },
      { noConfigSearch: true },
      mergeArrayComposer(
        jsonc.parse(baseConfig[".config/cspell/cspell.json"]) as CSpellUserSettings,
        jsonc.parse(templates[".config/cspell/cspell.json"]) as CSpellUserSettings,
      ),
    );
    return [
      `// spell-checker:ignore ${[...new Set(spellCheckResult.issues.map((issue) => issue.text))].join(" ")}`,
      content,
    ].join("\n");
  })();

  const dockerFilaPath = ".devcontainer/Dockerfile" satisfies keyof BaseConfigs;
  const dockerFileConfig = [
    baseConfig[dockerFilaPath],
    "RUN mkdir /usr/share/dotnet && chmod a+w /usr/share/dotnet",
  ].join("\n");

  return {
    ".devcontainer/.env": propertiesComposer(
      baseConfig[".devcontainer/.env"],
      fillTemplate(templates[".devcontainer/.env"], { remoteUser }),
    ),
    ".devcontainer/devcontainer.json": devContainerConfig,
    ".devcontainer/Dockerfile": dockerFileConfig,
    ".devcontainer/dot-config.json": JSON.stringify(
      defaultComposer(
        jsonc.parse(baseConfig[".devcontainer/dot-config.json"]) as object,
        jsonc.parse(templates[".devcontainer/dot-config.json"]) as object,
      ),
    ),
  };
};
