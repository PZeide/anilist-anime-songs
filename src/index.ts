import { observe } from '@violentmonkey/dom';
import AnimeSongsManager from './songs/AnimeSongsManager';
import consola from 'consola';

consola.level = 999;

const ANIME_ID_REGEXP = /anime\/(.+?)\//;
const logger = consola.withTag('aas:bootstrap');

function onLocationChange() {
  logger.debug(`Location changed to ${location.href}`);
  const match = ANIME_ID_REGEXP.exec(location.href);
  if (match === null || match.length === 0) return;

  // Check if the user is in the 'Overview' section of the anime page
  if (document.querySelector('.overview') === null) return;

  const animeId = parseInt(match[1]);
  logger.info(`Anime found with id ${animeId}`);
  const animeSongsManager = new AnimeSongsManager(animeId);
  animeSongsManager.init();
}

let lastLocation: string = location.href;
onLocationChange();

observe(document.head, () => {
  if (lastLocation === location.href) return false;

  lastLocation = location.href;
  onLocationChange();

  return false;
});
