import { mkdir } from "node:fs/promises";
import path from "node:path";

import { Argument, program } from "@commander-js/extra-typings";
import { kebabCase } from "lodash-es";
import writeFileAtomic from "write-file-atomic";

import { createBaseConfigs } from "./configs/base/index.js";
import { createCSharpConfigs } from "./configs/csharp/index.js";
import { createTypeScriptConfigs } from "./configs/typescript/index.js";
import { formatConfigs } from "./formatting.js";
import { packageJson } from "./package.js";
import type { ConfigFile } from "./types.js";

program.name(packageJson.name).version(packageJson.version);

program
  .addArgument(
    new Argument("[template]", "specify a template for the devcontainer")
      .choices(["base", "typescript", "csharp"])
      .default("base"),
  )
  .action(async (template) => {
    const currentPath = process.cwd();
    const projectName = kebabCase(path.basename(currentPath)) || "project";

    const baseConfig = await createBaseConfigs(projectName);

    let configFiles: ConfigFile[] = [];
    if (template === "base") {
      configFiles = await formatConfigs({ ...baseConfig });
    } else if (template === "typescript") {
      const configs = await createTypeScriptConfigs(projectName, baseConfig);
      configFiles = await formatConfigs({ ...configs });
    } else if (template === "csharp") {
      const configs = await createCSharpConfigs(baseConfig);
      configFiles = await formatConfigs({ ...configs });
    }
    for (const configFile of configFiles) {
      const filePath = path.resolve(currentPath, configFile.path);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFileAtomic(filePath, configFile.content);
    }
  });

await program.parseAsync();
