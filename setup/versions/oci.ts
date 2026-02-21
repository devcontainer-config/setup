import semver from "semver";

interface Challenge {
  scheme: string;
  params: Record<string, string>;
  token68?: string;
}

/**
 * RFC 7235 WWW-Authenticate parser.
 * challenge = auth-scheme [ 1*SP ( token68 / #auth-param ) ]
 */
function parseWWWAuthenticate(header: string): Challenge[] {
  const results: Challenge[] = [];
  let pos = 0;

  while (pos < header.length) {
    // Skip whitespace and commas (1#challenge)
    while (pos < header.length && (header[pos] === " " || header[pos] === "," || header[pos] === "\t")) {
      pos++;
    }
    if (pos >= header.length) {
      break;
    }

    // Match scheme (token)
    const schemeMatch = /^[a-zA-Z0-9!#$%&'*+.^_`|~-]+/.exec(header.slice(pos));
    if (!schemeMatch) {
      break;
    }
    const scheme = schemeMatch[0];
    pos += scheme.length;

    const params: Record<string, string> = {};
    let token68: string | undefined;

    // Check for SP before additional info
    if (pos < header.length && (header[pos] === " " || header[pos] === "\t")) {
      while (pos < header.length && (header[pos] === " " || header[pos] === "\t")) {
        pos++;
      }

      // Either token68 OR #auth-param
      while (pos < header.length) {
        // Skip OWS
        while (pos < header.length && (header[pos] === " " || header[pos] === "\t")) {
          pos++;
        }
        if (pos >= header.length || header[pos] === ",") {
          break;
        }

        // auth-param = token BWS "=" BWS ( token / quoted-string )
        const paramMatch =
          /^([a-zA-Z0-9!#$%&'*+.^_`|~-]+)\s*=\s*(?:([a-zA-Z0-9!#$%&'*+.^_`|~-]+)|"((?:[^"\\]|\\.)*)")/.exec(
            header.slice(pos),
          );

        if (paramMatch) {
          const name = paramMatch[1];
          const value = paramMatch[2] ?? paramMatch[3].replace(/\\(.)/g, "$1");
          params[name.toLowerCase()] = value;
          pos += paramMatch[0].length;

          // Skip OWS
          while (pos < header.length && (header[pos] === " " || header[pos] === "\t")) {
            pos++;
          }
          if (pos < header.length && header[pos] === ",") {
            pos++; // Consume for next auth-param
            continue;
          } else {
            break;
          }
        } else if (Object.keys(params).length === 0) {
          // Might be token68
          const token68Match = /^[a-zA-Z0-9._~+/-]+=*/.exec(header.slice(pos));
          if (token68Match) {
            token68 = token68Match[0];
            pos += token68.length;
          }
          break;
        } else {
          break;
        }
      }
    }
    results.push({ scheme, params, token68 });
  }
  return results;
}

interface Link {
  uri: string;
  params: Record<string, string>;
}

/**
 * RFC 5988 Link header parser.
 * Link = #link-value
 * link-value = "<" URI-Reference ">" *( ";" link-param )
 */
function parseLinkHeader(header: string): Link[] {
  const links: Link[] = [];
  let pos = 0;

  while (pos < header.length) {
    // Skip OWS and commas
    while (pos < header.length && (header[pos] === " " || header[pos] === "," || header[pos] === "\t")) {
      pos++;
    }
    if (pos >= header.length) {
      break;
    }

    // Match <URI-Reference>
    if (header[pos] !== "<") {
      break;
    }
    const uriEnd = header.indexOf(">", pos);
    if (uriEnd === -1) {
      break;
    }
    const uri = header.slice(pos + 1, uriEnd);
    pos = uriEnd + 1;

    const params: Record<string, string> = {};

    // Match parameters
    while (pos < header.length) {
      while (pos < header.length && (header[pos] === " " || header[pos] === "\t")) {
        pos++;
      }
      if (pos >= header.length || header[pos] === ",") {
        break;
      }

      if (header[pos] === ";") {
        pos++;
        while (pos < header.length && (header[pos] === " " || header[pos] === "\t")) {
          pos++;
        }

        const paramMatch =
          /^([a-zA-Z0-9!#$%&'*+.^_`|~-]+)\s*=\s*(?:([a-zA-Z0-9!#$%&'*+.^_`|~-]+)|"((?:[^"\\]|\\.)*)")/.exec(
            header.slice(pos),
          );

        if (paramMatch) {
          const name = paramMatch[1];
          const value = paramMatch[2] ?? paramMatch[3].replace(/\\(.)/g, "$1");
          params[name.toLowerCase()] = value;
          pos += paramMatch[0].length;
        } else {
          // Link extension without value
          const nameMatch = /^[a-zA-Z0-9!#$%&'*+.^_`|~-]+/.exec(header.slice(pos));
          if (nameMatch) {
            params[nameMatch[0].toLowerCase()] = "";
            pos += nameMatch[0].length;
          } else {
            break;
          }
        }
      } else {
        break;
      }
    }
    links.push({ uri, params });
  }
  return links;
}

export const getOciArtifactTags = async (repoName: string, pageSize = 100): Promise<string[]> => {
  const [host, ...repoPathParts] = repoName.split("/");
  const repoPath = repoPathParts.join("/");

  let currentToken: string | undefined;

  const fetchPage = async (url: string): Promise<{ tags: string[]; nextUrl?: string }> => {
    const getHeaders = () => (currentToken ? { Authorization: `Bearer ${currentToken}` } : {});
    let response = await fetch(url, { headers: getHeaders() });

    if (response.status === 401) {
      const wwwAuth = response.headers.get("WWW-Authenticate");
      if (!wwwAuth) {
        throw new Error("401 Unauthorized without WWW-Authenticate header");
      }

      const challenges = parseWWWAuthenticate(wwwAuth);
      const bearer = challenges.find((c) => c.scheme.toLowerCase() === "bearer");
      if (!bearer) {
        throw new Error(`Unsupported authentication scheme: ${challenges.map((c) => c.scheme).join(", ")}`);
      }

      const realm = bearer.params.realm;
      if (!realm) {
        throw new Error("Missing realm parameter in Bearer challenge");
      }

      const tokenUrl = new URL(realm);
      for (const [key, value] of Object.entries(bearer.params)) {
        if (key !== "realm") {
          tokenUrl.searchParams.set(key, value);
        }
      }

      const tokenResponse = await fetch(tokenUrl);
      if (!tokenResponse.ok) {
        throw new Error(`Failed to fetch token: HTTP ${tokenResponse.status}`);
      }
      const tokenData = (await tokenResponse.json()) as { token?: string; access_token?: string };
      currentToken = tokenData.token ?? tokenData.access_token;

      if (!currentToken) {
        throw new Error("Token response missing token/access_token");
      }

      // Retry original request with token
      response = await fetch(url, { headers: getHeaders() });
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = (await response.json()) as { tags: string[] };
    const tags = data.tags ?? [];

    let nextUrl: string | undefined;
    if (pageSize !== undefined) {
      const linkHeader = response.headers.get("Link");
      if (linkHeader) {
        const links = parseLinkHeader(linkHeader);
        const nextLink = links.find((l) => l.params.rel?.split(/\s+/).includes("next"));
        if (nextLink) {
          nextUrl = new URL(nextLink.uri, url).toString();
        }
      }
    }

    return { tags, nextUrl };
  };

  const initialUrl = new URL(`https://${host}/v2/${repoPath}/tags/list`);
  if (pageSize !== undefined) {
    initialUrl.searchParams.set("n", pageSize.toString());
  }

  const allTags: string[] = [];
  let currentUrl: string | undefined = initialUrl.toString();

  while (currentUrl) {
    const { tags, nextUrl } = await fetchPage(currentUrl);
    allTags.push(...tags);
    currentUrl = nextUrl;
  }

  return allTags;
};

export const getOciArtifactMaxMajorVersion = async (repositoryName: string): Promise<string> => {
  const tags = await getOciArtifactTags(repositoryName);
  const maxTag = semver.rsort(tags.filter((tag) => semver.valid(tag))).at(0);
  return maxTag ? semver.major(maxTag).toString() : "latest";
};
