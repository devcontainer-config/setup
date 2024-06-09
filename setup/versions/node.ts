import fetch from "node-fetch";
import semver from "semver";

export const getNodeLtsVersions = async (): Promise<number[]> => {
  const result: { value: number[] | undefined } = { value: undefined };
  return await (async () => {
    if (result.value === undefined) {
      const response = await fetch("https://nodejs.org/dist/index.json");
      const content = await response.text();
      const versions = JSON.parse(content) as { version: string; lts: false | string }[];
      const ltsVersions = versions
        .filter((v) => v.lts)
        .map((v) => semver.coerce(v.version))
        .flatMap((v) => (v?.major ? v.major : []));
      result.value = [...new Set(ltsVersions)].toSorted((a, b) => b - a);
    }
    return result.value;
  })();
};

export const getNodeLatestLtsVersion = async (): Promise<number> => {
  const versions = await getNodeLtsVersions();
  if (versions.length === 0) {
    throw new Error("No Node LTS versions found.");
  }
  return versions[0];
};
