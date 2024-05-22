import * as prettier from "prettier";

import type { ConfigFile } from "./types.js";

export const prettierConfig: prettier.Config = {
  printWidth: 120,
  plugins: [import.meta.resolve("prettier-plugin-packagejson")],
};

export const stringify = (value: unknown): string => JSON.stringify(value, null, 2);

export const prettierFormat = async (text: string, filepath: string): Promise<string> => {
  const fileInfo = await prettier.getFileInfo(filepath, prettierConfig);
  if (fileInfo.inferredParser) {
    return await prettier.format(text, { ...prettierConfig, filepath });
  } else {
    return text;
  }
};

export const formatConfigs = async (configs: Record<string, string>): Promise<ConfigFile[]> => {
  const formattedConfigs: ConfigFile[] = [];
  for (const [key, value] of Object.entries(configs)) {
    formattedConfigs.push({ path: key, content: await prettierFormat(value, key) });
  }
  return formattedConfigs;
};

export const fillTemplate = (template: string, values: Record<string, string>): string => {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    const pattern = `\${${key}}`;
    if (template.includes(pattern)) {
      result = result.replaceAll(pattern, value);
    } else {
      throw new Error(`Template does not contain pattern: ${pattern}`);
    }
  }
  return result;
};
