let profilingData: Record<string, number> | null = null;

export function startNetworkProfiling() {
  profilingData = {};
}

export function stopNetworkProfiling() {
  if (profilingData === null) return;
  console.log("Network profiling data:", profilingData);
  profilingData = null;
}

export async function rawRequest(
  url: string,
  options: Partial<Tampermonkey.Request> = {}
): Promise<Tampermonkey.Response<object>> {
  return new Promise((resolve, reject) => {
    if (profilingData !== null) {
      const domain = new URL(url).hostname;
      if (profilingData[domain] === undefined) profilingData[domain] = 0;

      profilingData[domain]++;
    }

    GM_xmlhttpRequest({
      url: url,
      onabort: () => reject(new Error("The request has been aborted.")),
      onerror: (error) => reject(error),
      ontimeout: () => reject(new Error("The request timed out.")),
      onload: (response) => {
        if (response.status === 429) {
          reject(new Error("Too many requests !"));
          return;
        }

        resolve(response);
      },
      ...options,
    });
  });
}

export async function requestJson(
  url: string,
  options: Partial<Tampermonkey.Request> = {}
): Promise<any> {
  const response = await rawRequest(url, options);
  try {
    return JSON.parse(response.responseText);
  } catch (error) {
    throw new Error(`Invalid JSON response: ${response}`);
  }
}
