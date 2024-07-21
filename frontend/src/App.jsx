import { useEffect, useState } from "react";
import "./App.css";
import Score from "./components/Score";
import CurrentScore from "./components/CurrentScore";
import Section from "./components/Section";
import Dice from "./components/Dice";
import io from "socket.io-client";
import { Link, useNavigate, useParams } from "react-router-dom";
import PlayerIndicator from "./components/PlayerIndicator";
import WaitingIndicator from "./components/WaitingIndicator";

const ENDPOINT = "http://localhost:3000";
let socket;

function App() {
  const [waiting, setWaiting] = useState(true);
  const [playerCount, setPlayerCount] = useState(0);
  const [playerNumber, setPlayerNumber] = useState(-1);
  const [scores, setScores] = useState([0, 0]);
  const [currentScore, setCurrentScore] = useState([0, 0]);
  const [activePlayer, setActivePlayer] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [src, setSrc] = useState(`dice-1.png`);
  const [win, setWin] = useState(2);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    let key;

    if (!id) {
      key = Math.trunc(Math.random() * 6) + 1;
      navigate(`/${key}`);
    }

    socket = io(ENDPOINT);
    socket.emit("setup", key ? String(key) : id);

    socket.on("connected", (playerNo) => {
      setPlayerNumber(() => {
        if (playerNo + 1 === 2) {
          setWaiting(false);
          setPlaying(true);
        }
        return playerNo;
      });
    });

    socket.on("newConnectionClient", (playerCount) => {
      if (playerCount + 1 === 2) {
        setWaiting(false);
        setPlaying(true);
      }
    });

    socket.on("rollDiceClient", (newCurrentScore, diceUrl) => {
      setCurrentScore(() => newCurrentScore);
      setSrc(diceUrl);
    });

    socket.on("switchPlayerClient", () => {
      switchPlayer();
    });

    socket.on("holdPlayerClient", (newScores) => {
      setScores(() => newScores);
    });

    socket.on("winPlayerClient", (winner) => {
      setWin(winner);
      setPlaying(false);
    });

    socket.on("newGameClient", () => {
      init();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  function switchPlayer() {
    setActivePlayer((prevActivePlayer) =>
      prevActivePlayer ? 0 : 1
    );
    setCurrentScore(() => [0, 0]);
  }

  function handleRollDice() {
    if (!playing) return;
    let diceNumber = Math.trunc(Math.random() * 6) + 1;
    let diceUrl = `dice-${diceNumber}.png`;
    setSrc(() => diceUrl);

    if (diceNumber !== 1) {
      setCurrentScore((currentScore) => {
        const newCurrentScore = activePlayer
          ? [currentScore[0], (currentScore[1] += diceNumber)]
          : [(currentScore[0] += diceNumber), currentScore[1]];
        socket.emit("rollDice", newCurrentScore, diceUrl, id);
        return newCurrentScore;
      });
    } else {
      // Switch to next player
      socket.emit("rollDice", currentScore, `dice-1.png`, id);
      switchPlayer();
      socket.emit("switchPlayer", id);
    }
  }

  function handleHold() {
    if (!playing) return;

    setScores((scores) => {
      const newScores = [
        scores[0] + currentScore[0],
        scores[1] + currentScore[1],
      ];

      socket.emit("holdPlayer", id, newScores);

      if (newScores[activePlayer] >= 100) {
        setPlaying(false);
        setWin(() => activePlayer);
        socket.emit("winPlayer", id, activePlayer);
      } else {
        switchPlayer();
        socket.emit("switchPlayer", id);
      }

      return newScores;
    });
  }

  function init() {
    setScores([0, 0]);
    setWin(2);
    setActivePlayer(0);
    setCurrentScore([0, 0]);
    setPlaying(true);
  }

  function handleNewGame() {
    init();
    socket.emit("newGame", id);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
      }}
    >
      {waiting && (
        <WaitingIndicator>
          <p>Waiting for other player -- </p>
          <Link
            target="_blank"
            to={`http://localhost:5173/${id}`}
          >
            Invite Link
          </Link>
        </WaitingIndicator>
      )}
      <PlayerIndicator
        playerNumber={playerNumber}
      ></PlayerIndicator>
      <main>
        <Section
          activePlayer={activePlayer}
          player={0}
          win={win}
        >
          <Score currentPlayer={0} score={scores[0]}></Score>
          <CurrentScore
            currentPlayer={0}
            currentScore={currentScore[0]}
          ></CurrentScore>
        </Section>
        <Section
          activePlayer={activePlayer}
          player={1}
          win={win}
        >
          <Score currentPlayer={1} score={scores[1]}></Score>
          <CurrentScore
            currentPlayer={1}
            currentScore={currentScore[1]}
          ></CurrentScore>
        </Section>

        <Dice src={src} playing={playing}></Dice>
        <button
          disabled={playing}
          onClick={handleNewGame}
          className="btn btn--new"
        >
          🔄 New game
        </button>
        <>
          <button
            onClick={handleRollDice}
            className={`btn btn--roll ${
              playing ? "" : "hidden"
            }`}
            disabled={activePlayer !== playerNumber}
          >
            🎲 Roll dice
          </button>
          <button
            disabled={activePlayer !== playerNumber}
            onClick={handleHold}
            className={`btn btn--hold ${
              playing ? "" : "hidden"
            }`}
          >
            📥 Hold
          </button>
        </>
      </main>
    </div>
  );
}

export default App;
