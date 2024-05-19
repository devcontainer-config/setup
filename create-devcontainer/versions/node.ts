import fetch from "node-fetch";
import semver from "semver";

export const getNodeLtsVersions = async () => {
  const response = await fetch("https://nodejs.org/dist/index.json");
  const content = await response.text();
  const versions = JSON.parse(content) as { version: string; lts: false | string }[];
  const ltsVersions = versions
    .filter((v) => v.lts)
    .map((v) => semver.coerce(v.version))
    .flatMap((v) => (v?.major ? v.major : []));
  return [...new Set(ltsVersions)].toSorted().toReversed();
};
