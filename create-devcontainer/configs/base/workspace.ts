import type { PackageJson } from "type-fest";

import { stringify } from "../../formatting.js";
import { getNpmLatestDependencies } from "../../versions/npm.js";

export interface BaseWorkspaceConfigs {
  "package.json": string;
}

export const createBaseWorkspaceConfigs = async (): Promise<BaseWorkspaceConfigs> => {
  const dependencies = await getNpmLatestDependencies(["cspell", "prettier", "prettier-plugin-packagejson"]);
  return {
    "package.json": stringify({
      private: true,
      type: "module",
      dependencies,
    } satisfies PackageJson),
  };
};
