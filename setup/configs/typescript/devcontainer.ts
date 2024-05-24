import type { CSpellUserSettings } from "cspell-lib";
import { spellCheckDocument } from "cspell-lib";
import * as jsonc from "jsonc-parser";

import { stringify } from "../../formatting.js";
import type { BaseConfigs } from "../base/index.js";
import { mergeArrayComposer } from "../composer.js";
import { loadTemplates } from "../templates.js";

export interface TypeScriptDevcontainerConfigs {
  ".devcontainer/devcontainer.json": string;
}

export const createTypeScriptDevcontainerConfigs = async (
  baseConfig: BaseConfigs,
): Promise<TypeScriptDevcontainerConfigs> => {
  const devcontainerConfigPath = ".devcontainer/devcontainer.json";
  const templates = await loadTemplates("typescript", [
    devcontainerConfigPath,
  ] satisfies (keyof TypeScriptDevcontainerConfigs)[]);

  const devContainerConfig = stringify(
    mergeArrayComposer(
      jsonc.parse(baseConfig[devcontainerConfigPath]) as object,
      jsonc.parse(templates[devcontainerConfigPath]) as object,
    ),
  );
  const spellCheckResult = await spellCheckDocument(
    { uri: devcontainerConfigPath, text: devContainerConfig },
    { noConfigSearch: true },
    jsonc.parse(baseConfig[".config/cspell/cspell.json"]) as CSpellUserSettings,
  );

  return {
    [devcontainerConfigPath]: [
      `// spell-checker:ignore ${[...new Set(spellCheckResult.issues.map((issue) => issue.text))].join(" ")}`,
      devContainerConfig,
    ].join("\n"),
  };
};
