function Dice({ src, playing }) {
  return (
    <img
      src={src}
      alt="Playing dice"
      className={`dice ${playing ? "" : "hidden"}`}
    />
  );
}

export default Dice;
