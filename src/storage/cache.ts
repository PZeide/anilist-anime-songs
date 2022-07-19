function unixTime() {
  return Math.floor(Date.now() / 1000);
}

function cache(name: string): string {
  return `cache:${name}`;
}

export const ANILIST_STAFF_ID_CACHE = "anilist-staff-id";
export const ANN_ANIME_ID_CACHE = "ann-anime-id";

export function getCachedItem<T>(cacheName: string, id: number): T | undefined {
  const data = GM_getValue(cache(cacheName));
  if (data === undefined) return undefined;

  if (Object.prototype.hasOwnProperty.call(data, id)) {
    const item = data[id];
    if (item.expires <= unixTime()) {
      delete data[id];
      GM_setValue(cache(cacheName), data);
      return undefined;
    }

    return item.value;
  }

  return undefined;
}

export function addCachedItem<T>(
  cacheName: string,
  id: number,
  value: T | undefined,
  ttl: number
): void {
  const expires = unixTime() + ttl;
  const data = GM_getValue(cache(cacheName), {});
  data[id] = { value, expires };
  GM_setValue(cache(cacheName), data);
}

export function garbageCollectCache(cacheName: string): void {
  console.log(`Garbage collecting ${cacheName} cache...`);
  const data = GM_getValue(cache(cacheName), {});
  for (const key of Object.keys(data)) {
    if (data[key].expires <= unixTime()) {
      delete data[key];
    }
  }
  GM_setValue(cache(cacheName), data);
}
