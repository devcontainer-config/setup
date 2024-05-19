import * as prettier from "prettier";

import type { Config, ConfigFile } from "./types.js";

export const prettierConfig: prettier.Config = {
  printWidth: 120,
  plugins: ["prettier-plugin-packagejson"],
};

export const stringify = (value: unknown): string => JSON.stringify(value, null, 2);

export const prettierFormat = (text: string, filepath: string): Promise<string> =>
  prettier.format(text, { ...prettierConfig, filepath });

export const formatConfigs = async <T extends Config>(configs: T): Promise<ConfigFile[]> => {
  const formattedConfigs: ConfigFile[] = [];
  for (const [key, value] of Object.entries(configs)) {
    if (typeof value === "string") {
      formattedConfigs.push({ path: key, content: await prettierFormat(value, key) });
    } else if (value !== undefined) {
      const content = value.join("\n\n") + "\n";
      formattedConfigs.push({ path: key, content });
    }
  }
  return formattedConfigs;
};
