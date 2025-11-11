import path from "node:path";

import { packagePrefix } from "@/scripts/project.js";
import { $$ } from "@/scripts/shell.js";
import { build } from "@/scripts/tasks/build.js";
import { deploy } from "@/scripts/tasks/deploy.js";
import pkg from "@/setup/package.json" with { type: "json" };

export const installPackage = async () => {
  const XDG_DATA_HOME = process.env.XDG_DATA_HOME;
  if (!XDG_DATA_HOME) {
    throw new Error("XDG_DATA_HOME is not set.");
  }

  await build();

  // Copy the dist folder to a temporary location
  const packageName = `${packagePrefix}${pkg.name}`;

  // Install the package globally after pnpm deploy.
  const installPath = path.resolve(XDG_DATA_HOME, pkg.name);
  await deploy(installPath);
  await $$({ reject: false })`pnpm uninstall --silent --global ${packageName}`;
  await $$`pnpm install --global ${installPath}`;
};
