import type { BaseDevContainerConfigs } from "./devcontainer.js";
import { createBaseDevContainerConfigs } from "./devcontainer.js";
import type { BaseDotConfigs } from "./dotConfig.js";
import { createBaseDotConfigs } from "./dotConfig.js";
import type { BaseWorkspaceConfigs } from "./workspace.js";
import { createBaseWorkspaceConfigs } from "./workspace.js";

export type BaseConfigs = BaseDevContainerConfigs & BaseDotConfigs & BaseWorkspaceConfigs;

export const createBaseConfigs = async (projectName: string, remoteUser = "dev"): Promise<BaseConfigs> => {
  const devContainerConfigs = await createBaseDevContainerConfigs(projectName, remoteUser);
  const dotConfigs = await createBaseDotConfigs(projectName, remoteUser);
  const workspaceConfigs = await createBaseWorkspaceConfigs();
  return {
    ...devContainerConfigs,
    ...dotConfigs,
    ...workspaceConfigs,
  };
};
