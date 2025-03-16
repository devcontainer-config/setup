import fetch from "node-fetch";
import semver from "semver";

export const getDotNetCoreReleaseIndex = async () => {
  const url = "https://raw.githubusercontent.com/dotnet/core/main/release-notes/releases-index.json";
  return fetch(url).then((res) => res.json()) as Promise<{
    "releases-index": {
      "channel-version": string;
      "latest-release": string;
      "latest-release-date": string;
      security: boolean;
      "latest-runtime": string;
      "latest-sdk": string;
      product: string;
      "release-type": string;
      "support-phase": string;
      "releases.json": string;
    }[];
  }>;
};

export const getDotNetCoreLtsReleases = async () => {
  const { "releases-index": releaseIndex } = await getDotNetCoreReleaseIndex();
  return releaseIndex
    .filter((release) => release["release-type"] === "lts")
    .filter((release) => release["support-phase"] === "active")
    .map((release) => ({
      version: semver.coerce(release["latest-release"]),
      release,
    }))
    .flatMap(({ version, release }) => (version?.major ? { version, release } : []))
    .toSorted((a, b) => semver.rcompare(a.version, b.version))
    .map((a) => a.release);
};

export const getDotNetCoreLatestLtsRelease = async () => {
  const releases = await getDotNetCoreLtsReleases();
  if (releases.length === 0) {
    throw new Error("No .NET Core LTS releases found.");
  }
  return releases[0];
};
