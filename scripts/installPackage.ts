// eslint-disable-next-line n/no-unsupported-features/node-builtins
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { $ } from "execa";

import { packagePrefix, projectRoot } from "@/scripts/project.js";
import { build } from "@/scripts/tasks/build.js";
import pkg from "@/setup/package.json" with { type: "json" };

const XDG_DATA_HOME = process.env.XDG_DATA_HOME;
if (!XDG_DATA_HOME) {
  throw new Error("XDG_DATA_HOME is not set.");
}

await build();

// Copy the dist folder to a temporary location
const packageName = `${packagePrefix}${pkg.name}`;
const tempPath = `/tmp/${packageName}`;
await rm(tempPath, { recursive: true, force: true });
await mkdir(tempPath, { recursive: true });
await cp(path.resolve(projectRoot, pkg.name, "dist"), tempPath, { recursive: true });
await writeFile(path.resolve(tempPath, "pnpm-workspace.yaml"), "");
await writeFile(
  path.resolve(tempPath, ".npmrc"),
  [
    "lockfile=false",
    "resolution-mode=time-based",
    "shared-workspace-lockfile=false",
    "inject-workspace-packages=true",
  ].join("\n"),
);

// Install the package globally after pnpm deploy.
process.env.NODE_ENV = "production";
const installPath = path.resolve(XDG_DATA_HOME, pkg.name);
await rm(installPath, { recursive: true, force: true });
const $$ = $({ stdio: "inherit", verbose: "full", cwd: tempPath });
await $$`pnpm deploy --filter=${packageName} --prod ${installPath}`;
await $$`npm uninstall --global ${packageName}`;
await $$`npm install --global ${installPath}`;
await $$`rm --recursive ${tempPath}`;
