const express = require("express");

const app = express();
const PORT = 3000;

app.route("/").get((req, res) => {
  res.send("hello");
});

const server = app.listen(PORT, () => {
  console.log("Server Started");
});

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  socket.on("setup", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} Joined in Room ${roomId}`);
    socket.emit("connected");
  });

  socket.on("rollDice", (newCurrentScore, diceUrl, id) => {
    socket
      .in(id)
      .emit("rollDiceClient", newCurrentScore, diceUrl);
  });

  socket.on("switchPlayer", (id) => {
    socket.in(id).emit("switchPlayerClient");
  });

  socket.on("holdPlayer", (id, newScores) => {
    socket.in(id).emit("holdPlayerClient", newScores);
  });

  socket.on("winPlayer", (id, winner) => {
    socket.in(id).emit("winPlayerClient", winner);
  });

  socket.on("newGame", (id) => {
    socket.in(id).emit("newGameClient");
  });

  socket.on("disconnect", () => {
    console.log(`Player Disconnected`);
  });
});
