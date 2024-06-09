import { readFile } from "node:fs/promises";
import path from "node:path";

export type TemplateKind = "base" | "typescript" | "csharp";

export const loadTemplate = (kind: TemplateKind, filePath: string): Promise<string> => {
  const fullPath = path.resolve(import.meta.dirname, "../templates", kind, filePath);
  return readFile(fullPath, "utf8");
};

export const loadTemplates = async <T extends string>(
  kind: TemplateKind,
  filePaths: T[],
): Promise<Record<T, string>> => {
  const templates: Record<T, string> = {} as Record<T, string>;
  for (const filePath of filePaths) {
    templates[filePath] = await loadTemplate(kind, filePath);
  }
  return templates;
};
