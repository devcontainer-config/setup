import path from "node:path";

export const projectRoot = path.resolve(import.meta.dirname, "..");

export const workspaces = path.resolve(projectRoot, "..");

export const csProjectRoot = path.resolve(projectRoot, "setup/templates/csharp");

export const packagePrefix = "@devcontainer-config/";
