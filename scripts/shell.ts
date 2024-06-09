import type { Options } from "execa";
import { $ } from "execa";

import { csProjectRoot, workspaces } from "@/scripts/project.js";

export const shellOptions: Options = { stdio: "inherit", verbose: "full", cwd: workspaces };

export const $$ = $(shellOptions);

export const cs$$ = $({ ...shellOptions, cwd: csProjectRoot });
