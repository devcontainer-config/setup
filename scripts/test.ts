import { mkdir, rm } from "node:fs/promises";

import { $ } from "execa";

import { packagePrefix } from "@/scripts/project.js";
import { installPackage } from "@/scripts/tasks/installPackage.js";

// Not to be run in CI.

await installPackage();

const tempPath = `/tmp/${packagePrefix}tests`;
const $$ = $({ stdio: "inherit", verbose: "full", cwd: tempPath });

const reset = async (path: string) => {
  await rm(path, { recursive: true, force: true });
  await mkdir(path, { recursive: true });
};

const cleanup = async (path: string) => {
  // https://github.com/devcontainers/cli/issues/386
  await rm(`${path}/.devcontainer/Dockerfile`);
  console.log("cleaning up...");
  await $({
    cwd: path,
    reject: false,
    stdio: "ignore",
  })`devcontainer up --remove-existing-container --workspace-folder ${tempPath}`;
  await $$`docker network prune --force`;
};

await reset(tempPath);
try {
  await $$`create-devcontainer csharp`;
  await $$`devcontainer up --remove-existing-container --workspace-folder ${tempPath}`;
  await $$`devcontainer exec --workspace-folder ${tempPath} pnpm lint`;
} finally {
  await cleanup(tempPath);
}

try {
  await reset(tempPath);
  await $$`create-devcontainer typescript`;
  await $$`devcontainer up --remove-existing-container --workspace-folder ${tempPath}`;
  await $$`devcontainer exec --workspace-folder ${tempPath} pnpm lint`;
} finally {
  await cleanup(tempPath);
}

await reset(tempPath);
