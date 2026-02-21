import type { BaseConfigs } from "../base/index.js";
import type { CSharpAutomationConfigs } from "./automation.js";
import { createCSharpAutomationConfigs } from "./automation.js";
import type { CSharpDevContainerConfigs } from "./devcontainer.js";
import { createCSharpDevContainerConfigs } from "./devcontainer.js";
import type { CSharpDotConfigs } from "./dotConfig.js";
import { createCSharpDotConfigs } from "./dotConfig.js";
import type { CSharpWorkspaceConfigs } from "./workspace.js";
import { createCSharpWorkspaceConfigs } from "./workspace.js";

export type CSharpConfigs = CSharpDevContainerConfigs &
  CSharpDotConfigs &
  CSharpAutomationConfigs &
  CSharpWorkspaceConfigs;

export const createCSharpConfigs = async <T extends BaseConfigs>(baseConfig: T): Promise<T & CSharpConfigs> => {
  const devContainerConfigs = await createCSharpDevContainerConfigs(baseConfig);
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
