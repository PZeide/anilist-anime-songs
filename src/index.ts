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
  setContainersError,
} from "./render";

import "@violentmonkey/dom";
import "@violentmonkey/ui";
import {
  ANILIST_STAFF_ID_CACHE,
  ANN_ANIME_ID_CACHE,
  garbageCollectCache,
} from "./storage/cache";

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

    async function tryRenderSongs(type: SongType) {
      try {
        renderSongs(songsGrid, type, await fetchSongs(type, anilistId));
      } catch (e) {
        console.error(`Error loading ${type} songs`, e);
        setContainersError(songsGrid, type);
      }
    }

    await tryRenderSongs("Opening");
    await tryRenderSongs("Insert");
    await tryRenderSongs("Ending");
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

// Cache garbage collection
garbageCollectCache(ANN_ANIME_ID_CACHE);
garbageCollectCache(ANILIST_STAFF_ID_CACHE);

VM.observe(document.head, () => {
  onHeadChange();
  return false;
});
