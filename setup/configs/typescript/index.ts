import type { BaseConfigs } from "../base/index.js";
import type { TypeScriptDevcontainerConfigs } from "./devcontainer.js";
import { createTypeScriptDevcontainerConfigs } from "./devcontainer.js";
import type { TypeScriptDotConfigs } from "./dotConfig.js";
import { createTypeScriptDotConfigs } from "./dotConfig.js";
import type { TypesScriptsScriptsConfigs } from "./scripts.js";
import { createTypesScriptsScriptsConfigs } from "./scripts.js";
import type { TypeScriptWorkspaceConfigs } from "./workspace.js";
import { createTypeScriptWorkspaceConfigs } from "./workspace.js";

export type TypeScriptConfigs = TypeScriptDevcontainerConfigs &
  TypeScriptDotConfigs &
  TypesScriptsScriptsConfigs &
  TypeScriptWorkspaceConfigs;

export const createTypeScriptConfigs = async <T extends BaseConfigs>(baseConfig: T): Promise<T & TypeScriptConfigs> => {
  const devContainerConfigs = await createTypeScriptDevcontainerConfigs(baseConfig);
  const dotConfigs = await createTypeScriptDotConfigs();
  const scriptsConfigs = await createTypesScriptsScriptsConfigs();
  const workspaceConfigs = await createTypeScriptWorkspaceConfigs(baseConfig);
  return {
    ...baseConfig,
    ...devContainerConfigs,
    ...dotConfigs,
    ...scriptsConfigs,
    ...workspaceConfigs,
  };
};
