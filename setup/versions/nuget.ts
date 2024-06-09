import fetch from "node-fetch";
import semver from "semver";

interface Endpoints {
  "PackageBaseAddress/3.0.0": string;
  "RegistrationsBaseUrl/3.6.0": string;
}

interface ServerIndex {
  resources: { "@id": string; "@type": string }[];
}

const getEndpoints = async (): Promise<Endpoints> => {
  const serverIndex = (await fetch("https://api.nuget.org/v3/index.json").then((response) =>
    response.json(),
  )) as ServerIndex;
  const getEndpoint = (type: keyof Endpoints) => {
    const endpoint = serverIndex.resources.find((resource) => resource["@type"] === type)?.["@id"];
    if (endpoint === undefined) {
      throw new Error(`Nuget endpoint not found for ${type}.`);
    }
    return endpoint;
  };

  return {
    "PackageBaseAddress/3.0.0": getEndpoint("PackageBaseAddress/3.0.0"),
    "RegistrationsBaseUrl/3.6.0": getEndpoint("RegistrationsBaseUrl/3.6.0"),
  };
};

export const getNugetPackageLatestVersion = async (packageName: string): Promise<string> => {
  packageName = packageName.toLowerCase();
  const endpoints = await getEndpoints();
  const versions = await (async () => {
    const { versions } = (await fetch(`${endpoints["PackageBaseAddress/3.0.0"]}${packageName}/index.json`).then(
      (response) => response.json(),
    )) as { versions: string[] };
    return semver.rsort(versions);
  })();
  for (const version of versions) {
    if (semver.prerelease(version)) {
      continue;
    }
    const { listed } = (await fetch(`${endpoints["RegistrationsBaseUrl/3.6.0"]}${packageName}/${version}.json`).then(
      (response) => response.json(),
    )) as { listed: boolean };
    if (!listed) {
      continue;
    }
    return version;
  }
  throw new Error(`No valid version found for Nuget package ${packageName}.`);
};
