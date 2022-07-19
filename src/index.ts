import { stylesheet } from "./style.module.css";
import {
  searchContainer,
  resetContainerInjector,
  runWithContainer,
} from "./container";
import { fetchSongs } from "./source/anisongdb";
import {
  createSongsContainer,
  createSongsGrid,
  removeSongsGrid,
  renderSongs,
} from "./render";

import "@violentmonkey/dom";
import "@violentmonkey/ui";

GM_addStyle(stylesheet);

const animeIdRegex = /anime\/(.+?)\//;
let url: string | null = null;

function addSongs(anilistId: number) {
  runWithContainer(async (container) => {
    console.log("Container found, adding songs...", container);

    const songsGrid = createSongsGrid(container);
    createSongsContainer(songsGrid, "Opening");
    createSongsContainer(songsGrid, "Insert");
    createSongsContainer(songsGrid, "Ending");

    renderSongs(songsGrid, "Opening", await fetchSongs("Opening", anilistId));
    renderSongs(songsGrid, "Insert", await fetchSongs("Insert", anilistId));
    renderSongs(songsGrid, "Ending", await fetchSongs("Ending", anilistId));
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
