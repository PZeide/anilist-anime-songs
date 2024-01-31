import consola, { ConsolaInstance } from 'consola';

export default class Cache<K extends NonNullable<unknown>, V> {
  private logger: ConsolaInstance;
  private cacheName: string;
  private cachePrefix: string;

  constructor(cacheName: string) {
    this.logger = consola.withTag(`aas:cache:${cacheName}`);
    this.cacheName = cacheName;
    this.cachePrefix = `$cache_${cacheName}`;
  }

  private cacheKey(key: K): string {
    const stringifiedKey = key.toString();
    return `${this.cachePrefix}_${stringifiedKey}`;
  }

  public async get(key: K): Promise<V | undefined> {
    try {
      const itemKey = this.cacheKey(key);
      const item = await GM.getValue(itemKey);

      return item as V;
    } catch (e) {
      this.logger.warn(`Failed to fetch cached item in cache ${this.cacheName} at ${key}`, e);
      return undefined;
    }
  }

  public async set(key: K, value: V) {
    if (value === undefined) {
      this.logger.warn(
        `Failed to set cached item in cache ${this.cacheName} at ${key}, undefined is not a valid value`,
      );
      return;
    }

    try {
      const itemKey = this.cacheKey(key);
      await GM.setValue(itemKey, value);
    } catch (e) {
      this.logger.warn(`Failed to set cached item in cache ${this.cacheName} at ${key}`, e);
    }
  }

  public async delete(key: K) {
    try {
      const itemKey = this.cacheKey(key);
      await GM.deleteValue(itemKey);
    } catch (e) {
      this.logger.warn(`Failed to delete item in cache ${this.cacheName} at ${key}`, e);
    }
  }

  public async exists(key: K): Promise<boolean> {
    try {
      const itemKey = this.cacheKey(key);
      const item = await GM.getValue(itemKey);
      return item === undefined;
    } catch (e) {
      this.logger.warn(`Failed to check if item exists in cache ${this.cacheName} at ${key}`, e);
      return false;
    }
  }
}
