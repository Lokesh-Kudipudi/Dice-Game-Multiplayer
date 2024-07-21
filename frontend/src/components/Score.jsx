function Score({ currentPlayer, score }) {
  return (
    <>
      <h2 className="name" id={`name--${currentPlayer}`}>
        Player {currentPlayer}
      </h2>
      <p className="score" id={`score--${currentPlayer}`}>
        {score}
      </p>
    </>
  );
}

export default Score;
