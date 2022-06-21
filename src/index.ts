import { stylesheet } from "./style.module.css";
import {
  searchContainer,
  resetContainerInjector,
  runWithContainer,
} from "./container";
import {
  fetchOpeningsSongs,
  fetchInsertSongs,
  fetchEndingSongs,
} from "./source/anisongdb";
import { deleteSongsContainers, renderSongs } from "./render";

GM_addStyle(stylesheet);

const animeIdRegex = /anime\/(.+?)\//;
let animeId: number | null = null;

function addSongs(anilistId: number) {
  const openingSongsPromise = fetchOpeningsSongs(anilistId);
  const insertSongsPromise = fetchInsertSongs(anilistId);
  const endingSongsPromise = fetchEndingSongs(anilistId);

  openingSongsPromise.then((songs) => console.log("Opening songs:", songs));
  insertSongsPromise.then((songs) => console.log("Insert songs:", songs));
  endingSongsPromise.then((songs) => console.log("Ending songs:", songs));

  runWithContainer((container) => {
    console.log("Container found, adding songs...", container);

    deleteSongsContainers(container);

    renderSongs(container, "Opening", openingSongsPromise);
    renderSongs(container, "Insert", insertSongsPromise);
    renderSongs(container, "Ending", endingSongsPromise);
  });
}

function onTitleChange() {
  const match = animeIdRegex.exec(location.href);
  if (match !== null && match.length > 1) {
    const newAnimeId = parseInt(match[1]);
    if (newAnimeId === animeId) return;

    animeId = newAnimeId;
    resetContainerInjector();
    searchContainer();
    addSongs(newAnimeId);
  } else {
    resetContainerInjector();
    animeId = null;
  }
}

VM.observe(document.head, () => {
  onTitleChange();
  return false;
});
