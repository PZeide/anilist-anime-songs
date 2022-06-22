import style from "../style.module.css";

export default function NoSongEntries() {
  const cryingEmoji = "｡ﾟ･（>﹏<）･ﾟ｡";
  return (
    <>
      <span className={style.noSongEntries}>No songs found {cryingEmoji}</span>
    </>
  );
}
