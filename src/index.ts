import { stylesheet } from "./style.module.css";
import {
  searchContainer,
  resetContainerInjector,
  runWithContainer,
} from "./container";
import { fetchOpeningsSongs, fetchInsertSongs, fetchEndingSongs } from "./source/anisongdb";

GM_addStyle(stylesheet);

const animeIdRegex = /anime\/(.+?)\//;
let animeId: number | null = null;

async function addSongs(anilistId: number) {
  const openingSongs = await fetchOpeningsSongs(anilistId);
  console.log("Opening songs found:", openingSongs);

  const insertSongs = await fetchInsertSongs(anilistId);
  console.log("Insert songs found:", insertSongs);

  const endingSongs = await fetchEndingSongs(anilistId);
  console.log("Ending songs found:", endingSongs);

  runWithContainer((container) => {
    console.log("Container found, adding songs...", container);
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
