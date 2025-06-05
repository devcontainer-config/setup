import type { X2jOptions } from "fast-xml-parser";
import { XMLBuilder, XMLParser } from "fast-xml-parser";

import { getDotNetCoreLatestLtsRelease } from "../../versions/dotnet.js";
import { loadTemplates } from "../templates.js";

export interface CSharpAutomationConfigs {
  "Automation/Tasks/CSharpier.cs": string;
  "Automation/Tasks/CSpell.cs": string;
  "Automation/Tasks/DotNetFormat.cs": string;
  "Automation/Tasks/Prettier.cs": string;
  "Automation/Automation.csproj": string;
  "Automation/Context.cs": string;
  "Automation/Format.cs": string;
  "Automation/Lint.cs": string;
  "Automation/Program.cs": string;
  "Automation/Restore.cs": string;
}

export const createCSharpAutomationConfigs = async (): Promise<CSharpAutomationConfigs> => {
  const templates = await loadTemplates("csharp", [
    "Automation/Tasks/CSharpier.cs",
    "Automation/Tasks/CSpell.cs",
    "Automation/Tasks/DotNetFormat.cs",
    "Automation/Tasks/Prettier.cs",
    "Automation/Automation.csproj",
    "Automation/Context.cs",
    "Automation/Format.cs",
    "Automation/Lint.cs",
    "Automation/Program.cs",
    "Automation/Restore.cs",
  ] as (keyof CSharpAutomationConfigs)[]);

  const csproj = await (async () => {
    const options = { preserveOrder: true, ignoreAttributes: false } satisfies X2jOptions;
    const content = new XMLParser(options).parse(templates["Automation/Automation.csproj"]) as [
      {
        Project: [{ PropertyGroup: [object, { TargetFramework: [{ "#text": string }] }] }, object];
      },
    ];

    const { "channel-version": dotnetVersion } = await getDotNetCoreLatestLtsRelease();
    content[0].Project[0].PropertyGroup[1].TargetFramework[0]["#text"] = `net${dotnetVersion}`;
    return new XMLBuilder(options).build(content);
  })();

  templates["Automation/Automation.csproj"] = csproj;
  return templates;
};
