import type { BaseDevcontainerConfigs } from "./devcontainer.js";
import { createBaseDevcontainerConfigs } from "./devcontainer.js";
import type { BaseDotConfigs } from "./dotConfig.js";
import { createBaseDotConfigs } from "./dotConfig.js";
import type { BaseWorkspaceConfigs } from "./workspace.js";
import { createBaseWorkspaceConfigs } from "./workspace.js";

export type BaseConfigs = BaseDevcontainerConfigs | BaseDotConfigs | BaseWorkspaceConfigs;

export const createBaseConfigs = async (projectName: string, remoteUser = "dev"): Promise<BaseConfigs> => {
  const devcontainerConfigs = await createBaseDevcontainerConfigs(projectName, remoteUser);
  const dotConfigs = createBaseDotConfigs(remoteUser);
  const workspaceConfigs = await createBaseWorkspaceConfigs();
  return {
    ...devcontainerConfigs,
    ...dotConfigs,
    ...workspaceConfigs,
  };
};
