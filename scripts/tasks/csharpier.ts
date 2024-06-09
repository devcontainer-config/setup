import { cs$$ } from "@/scripts/shell.js";

export const csharpierCheck = () => cs$$`pnpm run-script cake CSharpierCheck`;

export const csharpierFix = () => cs$$`pnpm run-script cake CSharpierFormat`;
