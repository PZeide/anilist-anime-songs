import style from "../style.module.css";
import { populateSentece, request } from "../utils";

const REPORT_STAFF_URL =
  "https://maker.ifttt.com/trigger/staff_mappings_report/with/key/ouuC58ABvq49sXEngMUaNqg0FZn7oFM8pnY4cPUqRKz";

type Properties = {
  song: AnimeSong;
};

function reportStaff(staff: AnimeSongStaff) {
  const data = {
    value1: staff.id.toString(),
    value2: staff.anilistId?.toString() || "null",
    value3: populateSentece(staff.names).join(""),
  };

  request(REPORT_STAFF_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    data: JSON.stringify(data),
  });
}

function formatStaffs(staffs: AnimeSongStaff[]) {
  function onStaffClick(event: MouseEvent, staff: AnimeSongStaff) {
    if (event.altKey && event.button === 0) {
      console.log(`Reporting staff ${staff.id}`);
      reportStaff(staff);
      const element = event.target as HTMLElement;
      element.style.cssText = "color: #bc4349 !important;";
      event.preventDefault();
    }
  }

  return populateSentece(staffs).map((data) => {
    if (typeof data === "string") return <span>{data}</span>;

    if (data.anilistId !== null) {
      return (
        <a
          href={`https://anilist.co/staff/${data.anilistId}`}
          data-id={data.id}
          onclick={(e: MouseEvent) => onStaffClick(e, data)}
        >
          {data.names[0]}
        </a>
      );
    } else {
      return (
        <span
          data-id={data.id}
          onclick={(e: MouseEvent) => onStaffClick(e, data)}
        >
          {data.names[0]}
        </span>
      );
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
