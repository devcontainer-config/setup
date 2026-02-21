import { rm } from "node:fs/promises";
import path from "node:path";

import { $ } from "execa";

import { projectName, projectRoot } from "@/scripts/project.js";
import { $$, cs$$, project$$ } from "@/scripts/shell.js";

await rm(path.resolve(projectRoot, "node_modules"), { recursive: true, force: true });
await $$`pnpm install`;
await project$$`dotnet tool restore`;
await project$$`dotnet restore`;
await cs$$`pnpm restore`;

// Create buildx builder
const { exitCode } = await $({ stdio: "ignore", reject: false })`docker buildx use ${projectName}`;
if (exitCode !== 0) {
  await $$`docker buildx create --name ${projectName} --use --bootstrap --driver-opt network=host`;
}
