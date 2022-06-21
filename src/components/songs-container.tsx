import LoadingSpinner from "./loading-spinner";

type Properties = {
  type: SongType;
};

export default function SongsContainer(props: Properties) {
  const identifier = `${props.type.toLowerCase()}s`;

  return (
    <>
      <div className="songs-container" id={identifier}>
        <h2>{props.type} songs</h2>
        <div className="song-entries-container" />
        <LoadingSpinner />
      </div>
    </>
  );
}
