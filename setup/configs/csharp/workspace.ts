import { defaultComposer } from "default-composer";
import { type X2jOptions, XMLBuilder, XMLParser } from "fast-xml-parser";
import type { PackageJson } from "type-fest";

import { getNpmLatestDependencies } from "../../versions/npm.js";
import { getNugetPackageLatestVersion } from "../../versions/nuget.js";
import type { BaseConfigs } from "../base/index.js";
import { loadTemplates } from "../templates.js";

export interface CSharpWorkspaceConfigs {
  "Directory.Build.props": string;
  "package.json": string;
  "Workspace.proj": string;
}

export const createCSharpWorkspaceConfigs = async (baseConfig: BaseConfigs): Promise<CSharpWorkspaceConfigs> => {
  const templates = await loadTemplates("csharp", [
    "Directory.Build.props",
    "package.json",
    "Workspace.proj",
  ] satisfies (keyof CSharpWorkspaceConfigs)[]);

  const packageJson = JSON.stringify(
    defaultComposer(JSON.parse(baseConfig["package.json"]) as object, JSON.parse(templates["package.json"]) as object, {
      dependencies: await getNpmLatestDependencies(["@prettier/plugin-xml", "prettier-plugin-ini"]),
    } satisfies PackageJson),
  );

  const workspaceProj = await (async () => {
    const options = { preserveOrder: true, ignoreAttributes: false } satisfies X2jOptions;
    const content = new XMLParser(options).parse(templates["Workspace.proj"]) as [
      {
        Project: [{ Sdk: []; ":@": { "@_Name": "Microsoft.Build.Traversal"; "@_Version": string } }, object];
      },
    ];

    const msbuildTraversalVersion = await getNugetPackageLatestVersion(content[0].Project[0][":@"]["@_Name"]);
    content[0].Project[0][":@"]["@_Version"] = msbuildTraversalVersion;
    return new XMLBuilder(options).build(content);
  })();
  return {
    "Directory.Build.props": templates["Directory.Build.props"],
    "package.json": packageJson,
    "Workspace.proj": workspaceProj,
  };
};
