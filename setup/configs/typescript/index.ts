import type { BaseConfigs } from "../base/index.js";
import type { TypeScriptDevContainerConfigs } from "./devcontainer.js";
import { createTypeScriptDevContainerConfigs } from "./devcontainer.js";
import type { TypeScriptDotConfigs } from "./dotConfig.js";
import { createTypeScriptDotConfigs } from "./dotConfig.js";
import type { TypesScriptsScriptsConfigs } from "./scripts.js";
import { createTypesScriptsScriptsConfigs } from "./scripts.js";
import type { TypeScriptWorkspaceConfigs } from "./workspace.js";
import { createTypeScriptWorkspaceConfigs } from "./workspace.js";

export type TypeScriptConfigs = TypeScriptDevContainerConfigs &
  TypeScriptDotConfigs &
  TypesScriptsScriptsConfigs &
  TypeScriptWorkspaceConfigs;

export const createTypeScriptConfigs = async <T extends BaseConfigs>(baseConfig: T): Promise<T & TypeScriptConfigs> => {
  const devContainerConfigs = await createTypeScriptDevContainerConfigs(baseConfig);
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
