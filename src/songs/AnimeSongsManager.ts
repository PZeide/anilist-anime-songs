import consola, { ConsolaInstance } from 'consola';

export default class AnimeSongsManager {
  private logger: ConsolaInstance;
  private animeId: number;

  constructor(animeId: number) {
    this.logger = consola.withTag('aas:manager');
    this.animeId = animeId;
  }

  public init() {}
}
