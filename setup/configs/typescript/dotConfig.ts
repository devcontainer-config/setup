import { defaultComposer } from "default-composer";
import type { TsConfigJson } from "type-fest";

import { getNodeLatestLtsVersion } from "../../versions/node.js";
import { loadTemplates } from "../templates.js";

export interface TypeScriptDotConfigs {
  ".config/typescript/tsconfig.node.json": string;
  ".config/eslint/tsconfig.json": string;
  ".config/eslint/eslint.config.ts": string;
}

export const createTypeScriptDotConfigs = async (): Promise<TypeScriptDotConfigs> => {
  const templates = await loadTemplates("typescript", [
    ".config/typescript/tsconfig.node.json",
    ".config/eslint/tsconfig.json",
    ".config/eslint/eslint.config.ts",
  ] satisfies (keyof TypeScriptDotConfigs)[]);

  const nodeVersion = await getNodeLatestLtsVersion();
  return {
    ".config/typescript/tsconfig.node.json": JSON.stringify(
      defaultComposer(JSON.parse(templates[".config/typescript/tsconfig.node.json"]) as TsConfigJson, {
        extends: `@tsconfig/node${nodeVersion}/tsconfig.json`,
      }),
    ),
    ".config/eslint/tsconfig.json": templates[".config/eslint/tsconfig.json"],
    ".config/eslint/eslint.config.ts": templates[".config/eslint/eslint.config.ts"],
  };
};
