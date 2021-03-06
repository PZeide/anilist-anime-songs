import style from "../style.module.css";

type Properties = {
  text: string;
};

export default function ErrorEntry(props: Properties) {
  const cryingEmoji = "｡ﾟ･（>﹏<）･ﾟ｡";
  return (
    <>
      <span className={style.errorEntry}>
        {props.text} {cryingEmoji}
      </span>
    </>
  );
}
