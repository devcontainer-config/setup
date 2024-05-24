import pacote from "pacote";

export const getNpmPackageDistTags = async (packageName: string) => {
  // spell-checker:ignore packument
  const packument = await pacote.packument(packageName);
  return packument["dist-tags"];
};

export const getNpmPackageLatestVersion = async (packageName: string) => {
  const distTags = await getNpmPackageDistTags(packageName);
  return distTags.latest;
};

export const getNpmPackagePeerDependencies = async (packageName: string, version: string) => {
  const manifest = await pacote.manifest(packageName, { version });
  return manifest.peerDependencies;
};

export const getNpmLatestDependencies = async <T extends string>(packageNames: T[]): Promise<Record<T, string>> => {
  const result = {} as Record<T, string>;
  for (const packageName of packageNames) {
    const version = await getNpmPackageLatestVersion(packageName);
    result[packageName] = `^${version}`;
  }
  return result;
};
