import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { $ } from "execa";

import { packageOutputPath, packagePrefix } from "@/scripts/project.js";
import { build } from "@/scripts/tasks/build.js";
import pkg from "@/setup/package.json" with { type: "json" };

export const deploy = async (packagePath: string) => {
  await build();

  // Copy the dist folder to a temporary location
  const packageName = `${packagePrefix}${pkg.name}`;
  const tempPath = `/tmp/${packageName}`;
  await rm(tempPath, { recursive: true, force: true });
  await mkdir(tempPath, { recursive: true });
  await cp(path.resolve(packageOutputPath, pkg.name), tempPath, { recursive: true });
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

  await rm(packagePath, { recursive: true, force: true });
  const $$ = $({
    stdio: "inherit",
    verbose: "full",
    cwd: tempPath,
    env: {
      ...process.env,
      NODE_ENV: "production",
    },
  });
  await $$`pnpm install`;
  await $$`pnpm deploy --filter=${packageName} --prod ${packagePath}`;
  await $$`rm --recursive ${tempPath}`;
};
