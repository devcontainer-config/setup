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
