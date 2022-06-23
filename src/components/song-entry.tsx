import style from "../style.module.css";
import { populateSentece } from "../utils";

type Properties = {
  song: AnimeSong;
};

export default function SongEntry(props: Properties) {
  return (
    <>
      <div className={style.songEntry}>
        <div>
          <div className={style.songTitle}>{props.song.name}</div>

          <div className={style.songArtist}>
            {populateSentece(props.song.artists).map((data) => {
              if (typeof data === "string") return <span>{data}</span>;

              if (data.anilistId !== null) {
                return (
                  <a href={`https://anilist.co/staff/${data.anilistId}`}>
                    {data.names[0]}
                  </a>
                );
              } else {
                return <span>{data.names[0]}</span>;
              }
            })}
          </div>
        </div>
      </div>
    </>
  );
}
