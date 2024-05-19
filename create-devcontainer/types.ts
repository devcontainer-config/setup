export type Config = Record<string, string | string[] | undefined>;

export interface ConfigFile {
  path: string;
  content: string;
}
