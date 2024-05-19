import { RegistryClientV2 } from "oci-registry-client";
import semver from "semver";

export const getOciArtifactTags = async (repositoryName: string): Promise<string[]> => {
  const client = new RegistryClientV2({ name: repositoryName });
  const tags = await client.listTags();
  return tags.tags;
};

export const getOciArtifactMaxMajorVersion = async (repositoryName: string): Promise<string> => {
  const tags = await getOciArtifactTags(repositoryName);
  const maxTag = semver.rsort(tags.filter((tag) => semver.valid(tag))).at(0);
  return maxTag ? semver.major(maxTag).toString() : "latest";
};
