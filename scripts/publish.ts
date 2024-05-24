import path from "node:path";

import { projectRoot } from "@/scripts/project.js";
import { $$ } from "@/scripts/shell.js";

await $$`npm set //registry.npmjs.org/:_authToken=\${NPM_TOKEN}`;
await $$`npm publish ${path.resolve(projectRoot, "create-devcontainer/dist")}`;
