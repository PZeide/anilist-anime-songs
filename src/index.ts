import { stylesheet } from "./style.module.css";
import {
  searchContainer,
  resetContainerInjector,
  runWithContainer,
} from "./container";
import { fetchSongs } from "./source/anisongdb";
import {
  createSongsGrid,
  deleteSongsGrid,
  removeSongsGrid,
  renderSongs,
} from "./render";

GM_addStyle(stylesheet);

const animeIdRegex = /anime\/(.+?)\//;
let animeId: number | null = null;

function addSongs(anilistId: number) {
  runWithContainer((container) => {
    console.log("Container found, adding songs...", container);

    const songsGrid = createSongsGrid(container);
    renderSongs(songsGrid, "Opening", fetchSongs("Opening", anilistId));
    renderSongs(songsGrid, "Insert", fetchSongs("Insert", anilistId));
    renderSongs(songsGrid, "Ending", fetchSongs("Ending", anilistId));
  });
}

function onTitleChange() {
  const match = animeIdRegex.exec(location.href);
  if (match !== null && match.length > 1) {
    const newAnimeId = parseInt(match[1]);
    if (newAnimeId === animeId) return;

    animeId = newAnimeId;
    removeSongsGrid();
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
