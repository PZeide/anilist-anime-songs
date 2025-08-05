import style from "../style.module.css";
import { SongStaffs } from "./song-staffs";

type Properties = {
  song: AnimeSong;
};

function fileLink(text: string, color: string, url: string) {
  return (
    <a
      className={style.songFile}
      href={`https://nawdist.animemusicquiz.com/${url}`}
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
      entry.classList.remove(style.expanded);
    } else {
      for (const other of document.querySelectorAll(
        `.${style.songEntry}.${style.expanded}`
      )) {
        if (other === entry) continue;

        const otherInfo = other.querySelector(
          `.${style.songInfo}`
        ) as HTMLElement;
        otherInfo.style.maxHeight = "0";
        other.classList.remove(style.expanded);
      }

      info.style.maxHeight = info.scrollHeight + "px";
      entry.classList.add(style.expanded);
    }
  }

  return (
    <>
      <div className={style.songEntry}>
        <div className="song-header">
          <div className={style.songTitle}>{props.song.name}</div>

          <div className={style.songArtist}>
            <SongStaffs staffs={props.song.artists} showGroupMembers={true} />
          </div>

          <a className={style.entryShowMore} onClick={toggleExpand}>
            <span data-v-550f7194 />
          </a>
        </div>
        <div className={style.songInfo}>
          {props.song.composers.length > 0 && (
            <div className={style.songInfoEntry}>
              <span>Composers: </span>
              <SongStaffs
                staffs={props.song.composers}
                showGroupMembers={true}
              />
            </div>
          )}

          {props.song.arrangers.length > 0 && (
            <div className={style.songInfoEntry}>
              <span>Arrangers: </span>
              <SongStaffs
                staffs={props.song.arrangers}
                showGroupMembers={true}
              />
            </div>
          )}

          {props.song.amqDifficulty && (
            <div className={style.songInfoEntry}>
              <span>AMQ difficulty: </span>
              {props.song.amqDifficulty}%
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
