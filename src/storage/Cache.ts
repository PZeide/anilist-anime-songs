import consola, { ConsolaInstance } from 'consola';

export default class Cache<K extends NonNullable<unknown>, V> {
  private logger: ConsolaInstance;
  private cacheName: string;
  private cachePrefix: string;

  constructor(cacheName: string) {
    this.logger = consola.withTag(`cache:${cacheName}`);
    this.cacheName = cacheName;
    this.cachePrefix = `$cache_${cacheName}`;
  }

  private cacheKey(key: K): string {
    const stringifiedKey = key.toString();
    return `${this.cachePrefix}_${stringifiedKey}`;
  }

  public async get(key: K): Promise<V | undefined> {
    const itemKey = this.cacheKey(key);
    const item = await GM.getValue(itemKey);
    return item as V;
  }

  public async set(key: K, value: V) {
    if (value === undefined) throw new Error(`Cannot set item in cache at ${key}, undefined is not a valid value!`);

    const itemKey = this.cacheKey(key);
    await GM.setValue(itemKey, value);
  }

  public async delete(key: K) {
    const itemKey = this.cacheKey(key);
    await GM.deleteValue(itemKey);
  }

  public async exists(key: K): Promise<boolean> {
    const itemKey = this.cacheKey(key);
    const item = await GM.getValue(itemKey);
    return item === undefined;
  }
}
