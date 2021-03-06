import style from "./style.module.css";
import SongEntry from "./components/song-entry";
import SongsContainer from "./components/songs-container";
import SongsGrid from "./components/songs-grid";
import ErrorEntry from "./components/error-entry";

export function createSongsGrid(parentContainer: Element): Element {
  const songsGrid = VM.m(<SongsGrid />);
  parentContainer.appendChild(songsGrid);
  return document.querySelector(`#${style.songsGrid}`);
}

export function removeSongsGrid() {
  document.querySelector(`#${style.songsGrid}`)?.remove();
}

export function createSongsContainer(
  songsGrid: Element,
  songType: SongType
): Element {
  const songsContainer = VM.m(<SongsContainer type={songType} />);
  songsGrid.appendChild(songsContainer);
  return songsGrid.querySelector(`#${songType.toLocaleLowerCase()}s`);
}

export async function renderSongs(
  songsGrid: Element,
  songType: SongType,
  songs: AnimeSong[]
) {
  const songsContainer = songsGrid.querySelector(
    `#${songType.toLocaleLowerCase()}s`
  );
  const entriesContainer = songsContainer.querySelector(
    `.${style.songsEntriesContainer}`
  );

  console.log(`Rendering ${songType} songs: ${songs.length}`, songs);
  songsContainer.querySelector(".loading-spinner").remove();

  const toRender = songs
    .filter((song) => song.type === songType)
    .sort((a, b) => a.index - b.index);

  if (toRender.length === 0) {
    entriesContainer.appendChild(VM.m(<ErrorEntry text="No songs found" />));
  } else {
    toRender.forEach((song) => {
      entriesContainer.appendChild(VM.m(<SongEntry song={song} />));
    });
  }
}

export function setContainersError(songsGrid: Element, songType: SongType) {
  const songsContainer = songsGrid.querySelector(
    `#${songType.toLocaleLowerCase()}s`
  );
  const entriesContainer = songsContainer.querySelector(
    `.${style.songsEntriesContainer}`
  );

  songsContainer.querySelector(".loading-spinner").remove();
  entriesContainer.appendChild(VM.m(<ErrorEntry text="An error occurred" />));
}
