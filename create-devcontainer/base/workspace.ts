import dedent from "dedent";
import type { PackageJson } from "type-fest";

import { stringify } from "../formatting.js";
import type { Config } from "../types.js";
import { getNpmPackageLatestVersion } from "../versions/npm.js";

export interface BaseWorkspaceConfigs extends Config {
  "pnpm-workspace.yaml": string;
  "package.json": string;
}

export const createBaseWorkspaceConfigs = async (): Promise<BaseWorkspaceConfigs> => {
  const versions = {
    cspell: await getNpmPackageLatestVersion("cspell"),
    prettier: await getNpmPackageLatestVersion("prettier"),
    "prettier-plugin-packagejson": await getNpmPackageLatestVersion("prettier-plugin-packagejson"),
  };
  return {
    "pnpm-workspace.yaml": dedent`
      packages:
      - "./**"
      `,
    "package.json": stringify({
      private: true,
      type: "module",
      dependencies: {
        cspell: `^${versions.cspell}`,
        prettier: `^${versions.prettier}`,
        "prettier-plugin-packagejson": `^${versions["prettier-plugin-packagejson"]}`,
      },
    } satisfies PackageJson),
  };
};
