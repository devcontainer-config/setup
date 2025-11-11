import { $ } from "execa";

import { projectName } from "@/scripts/project.js";
import { $$, cs$$, shellOptions } from "@/scripts/shell.js";

await cs$$`pnpm restore`;

// Create buildx builder
const { exitCode } = await $({ ...shellOptions, stdio: "ignore", reject: false })`docker buildx use ${projectName}`;
if (exitCode !== 0) {
  await $$`docker buildx create --name ${projectName} --use --bootstrap --driver-opt network=host`;
}
