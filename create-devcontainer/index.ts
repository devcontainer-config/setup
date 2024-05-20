import { createBaseConfigs } from "./configs/base/index.js";
import { createTypeScriptConfigs } from "./configs/typescript/index.js";
import { formatConfigs } from "./formatting.js";

const baseConfigs = await createBaseConfigs("test");
const typeScriptConfigs = await createTypeScriptConfigs(baseConfigs);
const configFiles = await formatConfigs({ ...typeScriptConfigs });
for (const configFile of configFiles) {
  console.log(configFile.path);
  console.log(configFile.content);
}
