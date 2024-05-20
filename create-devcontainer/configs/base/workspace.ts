import dedent from "dedent";
import type { PackageJson } from "type-fest";

import { stringify } from "../../formatting.js";
import { getNpmLatestDependencies } from "../../versions/npm.js";

export interface BaseWorkspaceConfigs {
  "pnpm-workspace.yaml": string;
  "package.json": string;
}

export const createBaseWorkspaceConfigs = async (): Promise<BaseWorkspaceConfigs> => {
  const dependencies = await getNpmLatestDependencies(["cspell", "prettier", "prettier-plugin-packagejson"]);
  return {
    "pnpm-workspace.yaml": dedent`
      packages:
      - "./**"
      `,
    "package.json": stringify({
      private: true,
      type: "module",
      dependencies,
    } satisfies PackageJson),
  };
};
