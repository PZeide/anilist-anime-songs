import consola, { ConsolaInstance } from 'consola';
import { ConfigManager } from './storage/Config';
import { observe } from '@violentmonkey/dom';

export default class AnilistAnimeSongs {
  private static INJECTOR_MARKER = 'ass_injected';
  private static ANIME_ID_REGEXP = /anime\/(.+?)\//;

  private logger: ConsolaInstance;
  private configManager: ConfigManager;

  private lastLocation: string;

  constructor() {
    this.logger = consola.withTag('bootstrapper');
    this.configManager = new ConfigManager();
  }

  public async start() {
    await this.configManager.init();

    observe(document.head, () => {
      this.checkForAnime();
      return false;
    });

    this.checkForAnime();
  }

  private checkForAnime() {
    const overview = document.querySelector('.overview') as HTMLElement;

    // Check if the div actually exists
    if (overview === null) return;

    const match = AnilistAnimeSongs.ANIME_ID_REGEXP.exec(location.href);
    if (match === null || match.length === 0) return;

    const animeId = parseInt(match[1]);

    // Check if ASS is not already injected
    if (overview.dataset[AnilistAnimeSongs.INJECTOR_MARKER] === animeId.toString()) return;

    this.logger.info(`Anime found with id ${animeId}`);
    overview.dataset[AnilistAnimeSongs.INJECTOR_MARKER] = animeId.toString();
    //this.loadAnimeSongs(animeId);
  }
}
