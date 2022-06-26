import style from "../style.module.css";
import LoadingSpinner from "./loading-spinner";

type Properties = {
  type: SongType;
};

export default function SongsContainer(props: Properties) {
  const identifier = `${props.type.toLowerCase()}s`;

  function toggleExpand(event: MouseEvent) {
    const container = (event.target as HTMLElement).closest(
      `.${style.songsContainer}`
    ) as HTMLElement;
    if (container === null) return;

    const entriesContainer = container.querySelector(
      `.${style.songsEntriesContainer}`
    ) as HTMLElement;
    if (entriesContainer === null) return;

    if (container.classList.contains(style.expanded)) {
      entriesContainer.style.maxHeight = "0";
      container.classList.remove(style.expanded);
    } else {
      entriesContainer.style.maxHeight = "100%";
      container.classList.add(style.expanded);
    }
  }

  return (
    <>
      <div
        className={`${style.songsContainer} ${style.expanded}`}
        id={identifier}
      >
        <h2 className="link" onClick={toggleExpand}>
          {props.type} songs
        </h2>
        <div className={style.songsEntriesContainer} />
        <LoadingSpinner />
      </div>
    </>
  );
}
