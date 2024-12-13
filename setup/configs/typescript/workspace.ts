import { defaultComposer } from "default-composer";
import semver from "semver";
import type { PackageJson } from "type-fest";

import { getNodeLatestLtsVersion } from "../../versions/node.js";
import { getNpmLatestDependencies, getNpmPackagePeerDependencies } from "../../versions/npm.js";
import type { BaseConfigs } from "../base/index.js";
import { loadTemplates } from "../templates.js";

export interface TypeScriptWorkspaceConfigs {
  "package.json": string;
  "tsconfig.json": string;
  "vite.config.ts": string;
}

export const createTypeScriptWorkspaceConfigs = async (
  baseConfig: BaseConfigs,
): Promise<TypeScriptWorkspaceConfigs> => {
  const templates = await loadTemplates("typescript", [
    "tsconfig.json",
    "vite.config.ts",
  ] satisfies (keyof TypeScriptWorkspaceConfigs)[]);

  const packageJson = JSON.parse(baseConfig["package.json"]) as PackageJson;
  const nodeVersion = await getNodeLatestLtsVersion();
  const dependencies = await getNpmLatestDependencies([
    "@commander-js/extra-typings",
    "@eslint/js",
    `@tsconfig/node${nodeVersion}`,
    "eslint-config-prettier",
    "eslint-flat-config-gitignore",
    "execa",
    "glob",
    "syncpack",
    "typescript",
    "typescript-eslint",
    "vite",
    "vite-node",
    "vite-tsconfig-paths",
  ]);
  const devDependencies = await getNpmLatestDependencies([
    "@types/eslint",
    "@types/eslint-config-prettier",
    "@types/eslint__js",
    "@types/node",
  ]);
  const commanderVersion = await getNpmPackagePeerDependencies(
    "@commander-js/extra-typings",
    semver.coerce(dependencies["@commander-js/extra-typings"])!.version,
  );
  return {
    "package.json": JSON.stringify(
      defaultComposer(packageJson, {
        scripts: {
          fix: "vite-node scripts/fix.ts",
          lint: "vite-node scripts/lint.ts",
          restore: "vite-node scripts/restore.ts",
          watch: "vite-node scripts/watch.ts",
        },
        dependencies: {
          ...dependencies,
          ...commanderVersion,
          typescript: "~5.6.3", // TypeScript 5.7 breaks json import for --module=node16, wait for https://github.com/microsoft/TypeScript/issues/60705
        },
        devDependencies: {
          ...devDependencies,
        },
      }),
    ),
    "tsconfig.json": templates["tsconfig.json"],
    "vite.config.ts": templates["vite.config.ts"],
  };
};
