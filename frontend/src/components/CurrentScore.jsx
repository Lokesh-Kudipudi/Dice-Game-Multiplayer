function CurrentScore({ currentPlayer, currentScore }) {
  return (
    <div className="current">
      <p className="current-label">Current</p>
      <p
        className="current-score"
        id={`current--${currentPlayer}`}
      >
        {currentScore}
      </p>
    </div>
  );
}

export default CurrentScore;
