import { createBaseConfigs } from "./base/index.js";
import { formatConfigs } from "./formatting.js";

const baseConfigs = await createBaseConfigs("test");
const configFiles = await formatConfigs(baseConfigs);
for (const configFile of configFiles) {
  console.log(configFile.path);
  console.log(configFile.content);
}
