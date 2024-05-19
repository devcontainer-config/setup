import dedent from "dedent";
import type { PackageJson } from "type-fest";

import { stringify } from "../formatting.js";
import type { Config } from "../types.js";

export interface BaseDotConfigs extends Config {
  ".config/cspell/cspell.json": string;
  ".config/git/attributes": string[];
  ".config/git/ignore": string[];
  ".config/pnpm/rc": string[];
  ".config/prettier/.prettierrc.json": string;
  ".config/workspaces/package.json": string;
}

export const createBaseDotConfigs = (remoteUser: string): BaseDotConfigs => ({
  ".config/cspell/cspell.json": stringify({
    version: "0.2",
    enableGlobDot: true,
    useGitignore: true,
    ignorePaths: ["**/node_modules/**", "LICENSE"],
    words: ["devcontainer", "devcontainers", "packagejson"],
  }),
  ".config/git/attributes": ["* text=auto eol=lf"],
  ".config/git/ignore": [
    dedent`
      .*
      _*
      !.devcontainer/
      !**/.devcontainer/**
      !.config/
      !**/.config/**
      `,
    dedent`
      node_modules/
      `,
  ],
  ".config/pnpm/rc": [
    dedent`
      ignore-workspace-root-check=true
      lockfile=false
      resolution-mode=time-based
      store-dir=/home/${remoteUser}/.local/share/pnpm/store
      `,
  ],
  ".config/prettier/.prettierrc.json": stringify({
    printWidth: 120,
    plugins: ["prettier-plugin-packagejson"],
  }),
  ".config/workspaces/package.json": stringify({
    private: true,
    type: "module",
  } satisfies PackageJson),
});
