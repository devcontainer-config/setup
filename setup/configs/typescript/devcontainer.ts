import type { CSpellUserSettings } from "cspell-lib";
import { spellCheckDocument } from "cspell-lib";
import { defaultComposer } from "default-composer";
import * as jsonc from "jsonc-parser";

import type { BaseConfigs } from "../base/index.js";
import { mergeArrayComposer } from "../composer.js";
import { loadTemplates } from "../templates.js";

export interface TypeScriptDevContainerConfigs {
  ".devcontainer/dot-config.json": string;
  ".devcontainer/devcontainer.json": string;
}

export const createTypeScriptDevContainerConfigs = async (
  baseConfig: BaseConfigs,
): Promise<TypeScriptDevContainerConfigs> => {
  const devContainerConfigPath = ".devcontainer/devcontainer.json";
  const templates = await loadTemplates("typescript", [
    ".devcontainer/dot-config.json",
    devContainerConfigPath,
  ] satisfies (keyof TypeScriptDevContainerConfigs)[]);

  const devContainerConfig = JSON.stringify(
    mergeArrayComposer(
      jsonc.parse(baseConfig[devContainerConfigPath]) as object,
      jsonc.parse(templates[devContainerConfigPath]) as object,
    ),
  );
  const spellCheckResult = await spellCheckDocument(
    { uri: devContainerConfigPath, text: devContainerConfig },
    { noConfigSearch: true },
    jsonc.parse(baseConfig[".config/cspell/cspell.json"]) as CSpellUserSettings,
  );

  return {
    [devContainerConfigPath]: [
      `// spell-checker:ignore ${[...new Set(spellCheckResult.issues.map((issue) => issue.text))].join(" ")}`,
      devContainerConfig,
    ].join("\n"),
    ".devcontainer/dot-config.json": JSON.stringify(
      defaultComposer(
        jsonc.parse(baseConfig[".devcontainer/dot-config.json"]) as object,
        jsonc.parse(templates[".devcontainer/dot-config.json"]) as object,
      ),
    ),
  };
};
