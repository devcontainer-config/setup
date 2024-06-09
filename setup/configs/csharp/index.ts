import type { BaseConfigs } from "../base/index.js";
import type { CSharpAutomationConfigs } from "./automation.js";
import { createCSharpAutomationConfigs } from "./automation.js";
import type { CSharpDevcontainerConfigs } from "./devcontainer.js";
import { createCSharpDevcontainerConfigs } from "./devcontainer.js";
import type { CSharpDotConfigs } from "./dotConfig.js";
import { createCSharpDotConfigs } from "./dotConfig.js";
import type { CSharpWorkspaceConfigs } from "./workspace.js";
import { createCSharpWorkspaceConfigs } from "./workspace.js";

export type CSharpConfigs = CSharpDevcontainerConfigs &
  CSharpDotConfigs &
  CSharpAutomationConfigs &
  CSharpWorkspaceConfigs;

export const createCSharpConfigs = async <T extends BaseConfigs>(
  baseConfig: T,
  remoteUser = "dev",
): Promise<T & CSharpConfigs> => {
  const devContainerConfigs = await createCSharpDevcontainerConfigs(baseConfig, remoteUser);
  const dotConfigs = await createCSharpDotConfigs(baseConfig);
  const automationConfigs = await createCSharpAutomationConfigs();
  const workspaceConfigs = await createCSharpWorkspaceConfigs(baseConfig);
  return {
    ...baseConfig,
    ...devContainerConfigs,
    ...dotConfigs,
    ...automationConfigs,
    ...workspaceConfigs,
  };
};
