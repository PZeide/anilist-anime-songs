import style from "../style.module.css";
import { populateSentece } from "../utils";

type Properties = {
  song: AnimeSong;
};

function formatStaffs(staffs: AnimeSongStaff[]) {
  return populateSentece(staffs).map((data) => {
    if (typeof data === "string") return <span>{data}</span>;

    if (data.anilistId !== null) {
      return (
        <a
          href={`https://anilist.co/staff/${data.anilistId}`}
          data-id={data.id}
        >
          {data.names[0]}
        </a>
      );
    } else {
      return <span data-id={data.id}>{data.names[0]}</span>;
    }
  });
}

function fileLink(text: string, color: string, url: string) {
  return (
    <a
      className={style.songFile}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={`background-color: ${color}`}
    >
      {text}
    </a>
  );
}

export default function SongEntry(props: Properties) {
  function toggleExpand(event: MouseEvent) {
    const entry = (event.target as HTMLElement).closest(`.${style.songEntry}`);
    if (entry === null) return;

    const info = entry.querySelector(`.${style.songInfo}`) as HTMLElement;
    if (info === null) return;

    if (entry.classList.contains(style.expanded)) {
      info.style.maxHeight = null;
    } else {
      info.style.maxHeight = info.scrollHeight + "px";
    }

    entry.classList.toggle(style.expanded);
  }

  return (
    <>
      <div className={style.songEntry}>
        <div className="song-header">
          <div className={style.songTitle}>{props.song.name}</div>

          <div className={style.songArtist}>
            {formatStaffs(props.song.artists)}
          </div>

          <a className={style.entryShowMore} onClick={toggleExpand}>
            <span data-v-550f7194 />
          </a>
        </div>
        <div className={style.songInfo}>
          {props.song.composers.length > 0 && (
            <div className={style.songComposersArrangers}>
              <span>Composers: </span>
              {formatStaffs(props.song.composers)}
            </div>
          )}

          {props.song.arrangers.length > 0 && (
            <div className={style.songComposersArrangers}>
              <span>Arrangers: </span>
              {formatStaffs(props.song.arrangers)}
            </div>
          )}

          {(props.song.files.audio !== null ||
            props.song.files.mediumQuality !== null ||
            props.song.files.highQuality !== null) && (
            <div className={style.songFiles}>
              {props.song.files.audio &&
                fileLink("Audio", "#9256f3", props.song.files.audio)}

              {props.song.files.mediumQuality &&
                fileLink(
                  "Medium Quality",
                  "#34c157",
                  props.song.files.mediumQuality
                )}

              {props.song.files.highQuality &&
                fileLink(
                  "High Quality",
                  "#c19934",
                  props.song.files.highQuality
                )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
