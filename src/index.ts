import { stylesheet } from "./style.module.css";
import {
  searchContainer,
  resetContainerInjector,
  runWithContainer,
} from "./container";
import { fetchSongs } from "./source/anisongdb";
import { createSongsGrid, removeSongsGrid, renderSongs } from "./render";

GM_addStyle(stylesheet);

const animeIdRegex = /anime\/(.+?)\//;
let url: string | null = null;

function addSongs(anilistId: number) {
  runWithContainer((container) => {
    console.log("Container found, adding songs...", container);

    const songsGrid = createSongsGrid(container);
    renderSongs(songsGrid, "Opening", fetchSongs("Opening", anilistId));
    renderSongs(songsGrid, "Insert", fetchSongs("Insert", anilistId));
    renderSongs(songsGrid, "Ending", fetchSongs("Ending", anilistId));
  });
}

function onHeadChange() {
  if (url === location.href) return;
  const match = animeIdRegex.exec(location.href);
  if (
    match !== null &&
    match.length > 1 &&
    document.querySelector(".overview") !== null
  ) {
    const animeId = parseInt(match[1]);

    url = location.href;

    removeSongsGrid();
    resetContainerInjector();
    searchContainer();
    addSongs(animeId);
  } else {
    resetContainerInjector();
    url = null;
  }
}

VM.observe(document.head, () => {
  onHeadChange();
  return false;
});
