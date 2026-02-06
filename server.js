const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

const rooms = {}; 
io.on("connection", socket => {
  console.log("User connected:", socket.id);

  socket.on("join-room", roomId => {
    if (!rooms[roomId]) {
      rooms[roomId] = { players: [], picks: {} };
    }

    if (rooms[roomId].players.length >= 2) {
      socket.emit("room-full");
      return;
    }

    rooms[roomId].players.push(socket.id);
    socket.join(roomId);

    socket.emit("joined", roomId);

    if (rooms[roomId].players.length === 2) {
      io.to(roomId).emit("start-game");
    }
  });

  socket.on("pick", ({ roomId, choice }) => {
    rooms[roomId].picks[socket.id] = choice;

    if (Object.keys(rooms[roomId].picks).length === 2) {
      const [p1, p2] = rooms[roomId].players;
      const c1 = rooms[roomId].picks[p1];
      const c2 = rooms[roomId].picks[p2];

      io.to(p1).emit("result", { you: c1, opp: c2 });
      io.to(p2).emit("result", { you: c2, opp: c1 });

      rooms[roomId].picks = {};
    }
  });

  socket.on("disconnect", () => {
    for (let roomId in rooms) {
      rooms[roomId].players =
        rooms[roomId].players.filter(id => id !== socket.id);

      if (rooms[roomId].players.length === 0) {
        delete rooms[roomId];
      }
    }
  });
});

http.listen(3000, (err) => {
    if (err) {
        throw err;
    }
  console.log("Server running on http://localhost:3000")
});
