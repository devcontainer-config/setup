import type { CSpellUserSettings } from "cspell-lib";
import { defaultComposer } from "default-composer";
import * as jsonc from "jsonc-parser";
import type { TsConfigJson } from "type-fest";

import { fillTemplate } from "../../formatting.js";
import { getNodeLatestLtsVersion } from "../../versions/node.js";
import type { BaseConfigs } from "../base/index.js";
import { mergeArrayComposer } from "../composer.js";
import { loadTemplates } from "../templates.js";

export interface TypeScriptDotConfigs {
  ".config/cspell/cspell.json": string;
  ".config/typescript/tsconfig.node.json": string;
  ".config/eslint/tsconfig.json": string;
  ".config/eslint/eslint.config.ts": string;
  ".config/workspaces/pnpm-workspace.yaml": string;
}

export const createTypeScriptDotConfigs = async (
  projectName: string,
  baseConfig: BaseConfigs,
): Promise<TypeScriptDotConfigs> => {
  const templates = await loadTemplates("typescript", [
    ".config/cspell/cspell.json",
    ".config/typescript/tsconfig.node.json",
    ".config/eslint/tsconfig.json",
    ".config/eslint/eslint.config.ts",
    ".config/workspaces/pnpm-workspace.yaml",
  ] satisfies (keyof TypeScriptDotConfigs)[]);

  const nodeVersion = await getNodeLatestLtsVersion();
  return {
    ".config/cspell/cspell.json": JSON.stringify(
      mergeArrayComposer(
        jsonc.parse(baseConfig[".config/cspell/cspell.json"]) as CSpellUserSettings,
        jsonc.parse(templates[".config/cspell/cspell.json"]) as CSpellUserSettings,
      ),
    ),
    ".config/typescript/tsconfig.node.json": JSON.stringify(
      defaultComposer(jsonc.parse(templates[".config/typescript/tsconfig.node.json"]) as TsConfigJson, {
        extends: `@tsconfig/node${nodeVersion}/tsconfig.json`,
      }),
    ),
    ".config/eslint/tsconfig.json": templates[".config/eslint/tsconfig.json"],
    ".config/eslint/eslint.config.ts": templates[".config/eslint/eslint.config.ts"],
    ".config/workspaces/pnpm-workspace.yaml": fillTemplate(templates[".config/workspaces/pnpm-workspace.yaml"], {
      projectName,
    }),
  };
};
