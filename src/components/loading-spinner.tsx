import { randomAnilistEmoji } from "../utils";

export default function LoadingSpinner() {
  return (
    <>
      <span className="loading-spinner" slot="spinner">
        <div className="emoji-spinner">{randomAnilistEmoji()}</div>
      </span>
    </>
  );
}
