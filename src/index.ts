import { stylesheet } from "./style.module.css";
import {
  searchContainer,
  resetContainerInjector,
  runWithContainer,
} from "./container";
import { fetchSongs } from "./source/anisongdb";
import { createSongsGrid, deleteSongsGrid, renderSongs } from "./render";

GM_addStyle(stylesheet);

const animeIdRegex = /anime\/(.+?)\//;
let animeId: number | null = null;

function addSongs(anilistId: number) {
  const openingSongsPromise = fetchSongs("Opening", anilistId);
  const insertSongsPromise = fetchSongs("Insert", anilistId);
  const endingSongsPromise = fetchSongs("Ending", anilistId);

  openingSongsPromise.then((songs) => console.log("Opening songs:", songs));
  insertSongsPromise.then((songs) => console.log("Insert songs:", songs));
  endingSongsPromise.then((songs) => console.log("Ending songs:", songs));

  runWithContainer((container) => {
    console.log("Container found, adding songs...", container);

    deleteSongsGrid(container);
    const songsGrid = createSongsGrid(container);
    renderSongs(songsGrid, "Opening", openingSongsPromise);
    renderSongs(songsGrid, "Insert", insertSongsPromise);
    renderSongs(songsGrid, "Ending", endingSongsPromise);
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
