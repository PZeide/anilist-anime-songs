import consola, { ConsolaInstance } from 'consola';

type Config = {
  showAmqDifficulty: boolean;
};

export const DEFAULT_CONFIG: Config = {
  showAmqDifficulty: false,
};

export class ConfigManager {
  private static CONFIG_KEY = 'config';

  private logger: ConsolaInstance;
  private configProxy: Config;

  constructor() {
    this.logger = consola.withTag('cfgmanager');
  }

  public async init(): Promise<Config> {
    this.logger.info('Loading config from script storage.');

    const config = await GM.getValue(ConfigManager.CONFIG_KEY, DEFAULT_CONFIG);

    this.configProxy = new Proxy(config, {
      set: (target, property, value) => {
        target[property] = value;

        this.save()
          .then(() => {
            this.logger.debug('Successfully written config to script storage.');
          })
          .catch((e) => {
            this.logger.error('Failed to write config to script storage!', e);
          });

        return true;
      },
    });

    return this.configProxy;
  }

  private async save() {
    await GM.setValue(ConfigManager.CONFIG_KEY, this.configProxy);
  }

  public getConfig() {
    if (this.logger === undefined) throw new Error('Config not initialized!');
    return this.configProxy;
  }
}
