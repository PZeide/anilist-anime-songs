type Config = {
  debug: boolean;
};

export class ConfigManager {
  private static CONFIG_KEY = 'config';
  private static DEFAULT_CONFIG: Config = {
    debug: false,
  };
}
