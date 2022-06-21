function unixTime() {
  return Math.floor(Date.now() / 1000);
}

function cache(name: string): string {
  return `cache:${name}`;
}

export function getCachedItem<T>(cacheName: string, id: number): T | null {
  const data = GM_getValue(cache(cacheName));
  if (data === undefined) {
    return null;
  }

  if (Object.prototype.hasOwnProperty.call(data, id)) {
    const item = data[id];
    if (item.expires <= unixTime()) {
      delete data[id];
      GM_setValue(cache(cacheName), data);
      return null;
    }

    return item.value;
  }

  return null;
}

export function addCachedItem<T>(
  cacheName: string,
  id: number,
  value: T,
  ttl: number
): void {
  const expires = unixTime() + ttl;
  const data = GM_getValue(cache(cacheName), {});
  data[id] = { value, expires };
  GM_setValue(cache(cacheName), data);
}
