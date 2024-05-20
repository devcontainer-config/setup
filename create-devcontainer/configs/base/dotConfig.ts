import { fillTemplate } from "../../formatting.js";
import { loadTemplates } from "../templates.js";

export interface BaseDotConfigs {
  ".config/cspell/cspell.json": string;
  ".config/git/attributes": string;
  ".config/git/ignore": string;
  ".config/pnpm/rc": string;
  ".config/prettier/.prettierrc.json": string;
  ".config/workspaces/package.json": string;
}

export const createBaseDotConfigs = async (remoteUser: string): Promise<BaseDotConfigs> => {
  const templates = await loadTemplates("base", [
    ".config/cspell/cspell.json",
    ".config/git/attributes",
    ".config/git/ignore",
    ".config/pnpm/rc",
    ".config/prettier/.prettierrc.json",
    ".config/workspaces/package.json",
  ] satisfies (keyof BaseDotConfigs)[]);
  return {
    ".config/cspell/cspell.json": templates[".config/cspell/cspell.json"],
    ".config/git/attributes": templates[".config/git/attributes"],
    ".config/git/ignore": templates[".config/git/ignore"],
    ".config/pnpm/rc": fillTemplate(templates[".config/pnpm/rc"], { remoteUser }),
    ".config/prettier/.prettierrc.json": templates[".config/prettier/.prettierrc.json"],
    ".config/workspaces/package.json": templates[".config/workspaces/package.json"],
  };
};
