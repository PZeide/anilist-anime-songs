import { stylesheet } from "./style.module.css";
import {
  searchContainer,
  resetContainerInjector,
  runWithContainer,
} from "./container";
import { fetchSongs } from "./source/anisongdb";

GM_addStyle(stylesheet);

const animeIdRegex = /anime\/(.+?)\//;
let animeId: number | null = null;

async function addSongs(anilistId: number) {
  const songs = await fetchSongs(anilistId);
  runWithContainer((container) => {
    console.log("Container found, adding songs...", container);
    console.log("Songs found:", songs);
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
    addSongs(newAnimeId)
      .catch((err) => console.error("Unhandled error adding songs:", err));
  } else {
    resetContainerInjector();
    animeId = null;
  }
}

VM.observe(document.head, () => {
  onTitleChange();
  return false;
});
