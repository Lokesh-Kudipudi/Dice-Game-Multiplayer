function Section({ activePlayer, player, children, win }) {
  return (
    <section
      className={`player player--${player} ${
        activePlayer === player ? "player--active" : ""
      } ${win === player ? "player--winner" : ""} `}
    >
      {children}
    </section>
  );
}

export default Section;
