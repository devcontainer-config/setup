import type { Config } from "default-composer";
import { defaultComposer, setConfig } from "default-composer";

export const createComposer = (config: Config): typeof defaultComposer => {
  return (...args) => {
    setConfig(config);
    const result = defaultComposer(...args);
    setConfig({});
    return result;
  };
};

export const mergeArrayComposer = createComposer({ mergeArrays: true });

export const propertiesComposer = (...text: string[]) => text.flatMap((t) => t.trimEnd().split("\n")).join("\n") + "\n";
