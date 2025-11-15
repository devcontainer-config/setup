import path from "node:path";

import { $ } from "execa";

import { projectRoot, workspaces } from "@/scripts/project.js";
import { $$ } from "@/scripts/shell.js";
import { getVersionTag } from "@/scripts/tasks/build.js";
import { deploy } from "@/scripts/tasks/deploy.js";

const platforms: string[] = ["linux/amd64", "linux/arm64"];

const packagePath = path.resolve(workspaces, "artifacts/package");

async function buildImage(registry: string, imageName: string, tags: string[], publish: boolean) {
  console.log("Building multi-arch Docker image...");

  const dockerfilePath = path.join(projectRoot, "docker/Dockerfile");
  const dockerPlatforms = platforms.join(",");

  const args = ["buildx", "build", "--file", dockerfilePath, "--platform", dockerPlatforms];

  for (const tag of tags) {
    args.push("--tag", `${registry}/${imageName}:${tag}`);
  }

  if (publish) {
    args.push("--push");
  }

  args.push(projectRoot);

  await $$`docker ${args}`;
  console.log("Docker image built successfully.");
}

const registry = process.env.REGISTRY ?? "local";
const imageName = process.env.IMAGE_NAME ?? "setup";
const version = await getVersionTag();
const tags = [version, "latest"];
const token = process.env.REGISTRY_TOKEN;
const publish = !!token;

if (publish) {
  await $({ verbose: "full", input: token })`docker login ${registry} --username USERNAME --password-stdin`;
}

await deploy(packagePath);
await buildImage(registry, imageName, tags, publish);
