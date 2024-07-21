import { useEffect, useState } from "react";
import "./App.css";
import Score from "./components/Score";
import CurrentScore from "./components/CurrentScore";
import Section from "./components/Section";
import Dice from "./components/Dice";
import io from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";
import PlayerIndicator from "./components/PlayerIndicator";

const ENDPOINT = "http://localhost:3000";
let socket;

function App() {
  const [scores, setScores] = useState([0, 0]);
  const [currentScore, setCurrentScore] = useState([0, 0]);
  const [activePlayer, setActivePlayer] = useState(0);
  const [playing, setPlaying] = useState(true);
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
    socket.emit("setup", key ? key : id);

    socket.on("connected", () => {
      console.log(`Connected from server - socket`);
    });

    socket.on("rollDiceClient", (newCurrentScore, diceUrl) => {
      console.log("Rolling Dice Client");
      setCurrentScore(() => newCurrentScore);
      setSrc(diceUrl);
    });

    socket.on("switchPlayerClient", () => {
      console.log("Switching Player Client");
      switchPlayer();
    });

    socket.on("holdPlayerClient", (newScores) => {
      console.log("holding Player Client");

      setScores(() => newScores);
    });

    socket.on("winPlayerClient", (winner) => {
      console.log("Winning Player Client");
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
    setCurrentScore((currentScore) => ({
      ...currentScore,
      [activePlayer]: 0,
    }));
    setActivePlayer((prevActivePlayer) =>
      prevActivePlayer ? 0 : 1
    );
  }

  function switchPlayerClientAndServer() {
    switchPlayer();
    socket.emit("switchPlayer", id);
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
      switchPlayerClientAndServer();
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

      if (newScores[activePlayer] >= 10) {
        setPlaying(false);
        setWin(() => activePlayer);
        socket.emit("winPlayer", id, activePlayer);
      } else {
        switchPlayerClientAndServer();
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
      <PlayerIndicator playerNumber={0}></PlayerIndicator>
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
            className="btn btn--roll"
          >
            🎲 Roll dice
          </button>
          <button onClick={handleHold} className="btn btn--hold">
            📥 Hold
          </button>
        </>
      </main>
    </div>
  );
}

export default App;
