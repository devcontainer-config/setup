import fs, { copyFile, cp } from "node:fs/promises";
import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import git from "isomorphic-git";
import * as prettier from "prettier";
import semver from "semver";
import type { PackageJson } from "type-fest";

import prettierOptions from "@/.config/prettier/.prettierrc.json" with { type: "json" };
import project from "@/package.json" with { type: "json" };
import { packageOutputPath, packagePrefix, projectRoot } from "@/scripts/project.js";
import { $$ } from "@/scripts/shell.js";
import pkg from "@/setup/package.json" with { type: "json" };

const dist = packageOutputPath;

const insertShebang = async (path: string) => {
  const content = await readFile(path, "utf-8");
  await writeFile(path, `#!/usr/bin/env node\n${content}`);
};

const clean = () => rm(dist, { recursive: true, force: true });

const compile = () => $$`tsc --project ${path.resolve(projectRoot, pkg.name, "tsconfig.json")}`;

export const getVersionTag = async () => {
  const tags = await git.listTags({ fs, dir: projectRoot });
  return semver.rsort(tags).at(0) ?? pkg.version;
};

const writePackageJson = async () => {
  const version = await getVersionTag();
  const url = (await git.listRemotes({ fs, dir: projectRoot })).at(0)?.url;
  const pkgJson: PackageJson = Object.assign({}, pkg as PackageJson, {
    name: `${packagePrefix}${pkg.name}`,
    version,
    ...(url && { repository: { type: "git", url } }),
    license: project.license,
  } satisfies PackageJson);
  const filepath = path.resolve(dist, "package.json");
  const packageJson = await prettier.format(JSON.stringify(pkgJson), { ...prettierOptions, filepath });
  await writeFile(filepath, packageJson);
};

export const build = async () => {
  await clean();
  await compile();
  await insertShebang(path.resolve(dist, "index.js"));
  await writePackageJson();
  await cp(path.resolve(projectRoot, pkg.name, "templates"), path.resolve(dist, "templates"), { recursive: true });
  await copyFile(path.resolve(projectRoot, "ReadMe.md"), path.resolve(dist, "ReadMe.md"));
};
