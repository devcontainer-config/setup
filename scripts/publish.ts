import path from "node:path";

import { projectRoot } from "@/scripts/project.js";
import { $$ } from "@/scripts/shell.js";
import pkg from "@/setup/package.json" with { type: "json" };

await $$`npm set //registry.npmjs.org/:_authToken=\${NPM_TOKEN}`;
await $$`npm publish --access public ${path.resolve(projectRoot, `${pkg.name}/dist`)}`;
