import { loadTemplates } from "../templates.js";

export interface TypesScriptsScriptsConfigs {
  "scripts/tasks/cspell.ts": string;
  "scripts/tasks/eslint.ts": string;
  "scripts/tasks/prettier.ts": string;
  "scripts/tasks/syncpack.ts": string;
  "scripts/tasks/tsc.ts": string;
  "scripts/fix.ts": string;
  "scripts/lint.ts": string;
  "scripts/project.ts": string;
  "scripts/shell.ts": string;
}

export const createTypesScriptsScriptsConfigs = async (): Promise<TypesScriptsScriptsConfigs> =>
  loadTemplates("typescript", [
    "scripts/tasks/cspell.ts",
    "scripts/tasks/eslint.ts",
    "scripts/tasks/prettier.ts",
    "scripts/tasks/syncpack.ts",
    "scripts/tasks/tsc.ts",
    "scripts/fix.ts",
    "scripts/lint.ts",
    "scripts/project.ts",
    "scripts/shell.ts",
  ] satisfies (keyof TypesScriptsScriptsConfigs)[]);
