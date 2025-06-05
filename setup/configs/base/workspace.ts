import type { PackageJson } from "type-fest";

import { getNpmLatestDependencies } from "../../versions/npm.js";

export interface BaseWorkspaceConfigs {
  "package.json": string;
}

export const createBaseWorkspaceConfigs = async (): Promise<BaseWorkspaceConfigs> => {
  const dependencies = await getNpmLatestDependencies([
    "cspell",
    "prettier",
    "prettier-plugin-packagejson",
    "prettier-plugin-sh",
  ]);
  return {
    "package.json": JSON.stringify({
      private: true,
      type: "module",
      dependencies,
    } satisfies PackageJson),
  };
};
