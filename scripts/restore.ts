import { cs$$ } from "@/scripts/shell.js";
import { eslintSetup } from "@/scripts/tasks/eslint.js";

await eslintSetup();
await cs$$`pnpm restore`;
