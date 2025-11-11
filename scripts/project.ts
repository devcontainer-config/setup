import path from "node:path";

export const projectName = "devcontainer-config-setup";

export const projectRoot = path.resolve(import.meta.dirname, "..");

export const workspaces = path.resolve(projectRoot, "..");

export const csProjectRoot = path.resolve(projectRoot, "setup/templates/csharp");

export const packagePrefix = "@devcontainer-config/";

export const packageOutputPath = path.resolve(projectRoot, `.local/dist`);
