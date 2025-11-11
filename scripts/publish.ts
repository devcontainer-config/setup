import { packageOutputPath } from "@/scripts/project.js";
import { $$ } from "@/scripts/shell.js";

await $$`npm set //registry.npmjs.org/:_authToken=\${NPM_TOKEN}`;
await $$`npm publish --access public ${packageOutputPath}`;
