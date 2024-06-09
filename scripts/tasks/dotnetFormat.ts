import { cs$$ } from "@/scripts/shell.js";

export const dotnetFormatCheck = () => cs$$`pnpm run-script cake DotNetFormatCheck`;

export const dotnetFormat = () => cs$$`pnpm run-script cake DotNetFormat`;
