import type { CSpellUserSettings } from "cspell-lib";
import type { X2jOptions } from "fast-xml-parser";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import * as jsonc from "jsonc-parser";

import { getNugetPackageLatestVersion } from "../../versions/nuget.js";
import type { BaseConfigs } from "../base/index.js";
import { mergeArrayComposer } from "../composer.js";
import { loadTemplates } from "../templates.js";

export interface CSharpDotConfigs {
  ".config/csharpier/.csharpierrc.json": string;
  ".config/cspell/cspell.json": string;
  ".config/dotnet/.globalconfig": string;
  ".config/dotnet/Format.targets": string;
  ".config/dotnet/Packages.props": string;
  ".config/dotnet/Project.props": string;
  ".config/dotnet/tools.json": string;
  ".config/prettier/.prettierrc.json": string;
  ".config/workspaces/Directory.Build.props": string;
}

export const createCSharpDotConfigs = async (baseConfig: BaseConfigs): Promise<CSharpDotConfigs> => {
  const templates = await loadTemplates("csharp", [
    ".config/csharpier/.csharpierrc.json",
    ".config/cspell/cspell.json",
    ".config/dotnet/.globalconfig",
    ".config/dotnet/Format.targets",
    ".config/dotnet/Packages.props",
    ".config/dotnet/Project.props",
    ".config/dotnet/tools.json",
    ".config/prettier/.prettierrc.json",
    ".config/workspaces/Directory.Build.props",
  ] satisfies (keyof CSharpDotConfigs)[]);

  const packageProps = await (async () => {
    const options = { preserveOrder: true, ignoreAttributes: false } satisfies X2jOptions;
    const content = new XMLParser(options).parse(templates[".config/dotnet/Packages.props"]) as [
      {
        Project: [object, { ItemGroup: { PackageVersion: []; ":@": { "@_Include": string; "@_Version": string } }[] }];
      },
    ];
    const packages = new Map(content[0].Project[1].ItemGroup.map((element) => [element[":@"]["@_Include"], element]));

    const cakeFrostingVersion = await getNugetPackageLatestVersion("Cake.Frosting");
    const cakeFrostingPackage = packages.get("Cake.Frosting");
    if (cakeFrostingPackage === undefined) {
      throw new Error("Cake.Frosting package not found in .config/dotnet/Packages.props");
    }
    cakeFrostingPackage[":@"]["@_Version"] = cakeFrostingVersion;
    return new XMLBuilder(options).build(content) as string;
  })();

  const toolsJson = await (async () => {
    const csharpierVersion = await getNugetPackageLatestVersion("csharpier");
    const content = jsonc.parse(templates[".config/dotnet/tools.json"]) as {
      tools: { csharpier: { version: string } };
    };
    content.tools.csharpier.version = csharpierVersion;
    return JSON.stringify(content);
  })();

  return {
    ".config/csharpier/.csharpierrc.json": templates[".config/csharpier/.csharpierrc.json"],
    ".config/cspell/cspell.json": JSON.stringify(
      mergeArrayComposer(
        jsonc.parse(baseConfig[".config/cspell/cspell.json"]) as CSpellUserSettings,
        jsonc.parse(templates[".config/cspell/cspell.json"]) as CSpellUserSettings,
      ),
    ),
    ".config/dotnet/.globalconfig": templates[".config/dotnet/.globalconfig"],
    ".config/dotnet/Format.targets": templates[".config/dotnet/Format.targets"],
    ".config/dotnet/Packages.props": packageProps,
    ".config/dotnet/Project.props": templates[".config/dotnet/Project.props"],
    ".config/dotnet/tools.json": toolsJson,
    ".config/prettier/.prettierrc.json": JSON.stringify(
      mergeArrayComposer(
        jsonc.parse(baseConfig[".config/prettier/.prettierrc.json"]) as object,
        jsonc.parse(templates[".config/prettier/.prettierrc.json"]) as object,
      ),
    ),
    ".config/workspaces/Directory.Build.props": templates[".config/workspaces/Directory.Build.props"],
  };
};
