import SongsContainer from "./components/songs-container";

function createSongsContainer(parentContainer: Element, songType: SongType): Node {
  const songsContainer = VM.m(<SongsContainer type={songType} />);
  parentContainer.appendChild(songsContainer);
  return parentContainer.querySelector(`#${songType.toLocaleLowerCase()}s`);
}

export function renderSongs(
  container: Element, 
  songType: "Opening" | "Insert" | "Ending", 
  songsPromise: Promise<AnimeSong[]>
) {
  const songsContainer = createSongsContainer(container, songType);
}

export function deleteSongsContainers(container: Element): void {
  container.querySelectorAll(".songs-container").forEach(songsContainer => {
    songsContainer.remove();
  });
}