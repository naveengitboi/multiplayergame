const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

//cors for cross origin
const cors = require("cors");

//tmx parser for map.tmx file
const tmx = require("tmx-parser");

//init
const app = express();
app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

//loading map
const loadMap = require("./mapLoader");

const inputsMap = {};
let players = [];
let snowballs = [];
const TICK_RATE = 30;
const SPEED = 5;
const SNOWBALL_SPEED = 8;

function tick(delta) {
  for (const player of players) {
    const inputs = inputsMap[player.id];
    if (inputs.up) {
      player.y -= SPEED;
    } else if (inputs.down) {
      player.y += SPEED;
    }

    if (inputs.right) {
      player.x += SPEED;
    } else if (inputs.left) {
      player.x -= SPEED;
    }
  }

  for (const snowball of snowballs) {
    snowball.x += Math.cos(snowball.angle) * SNOWBALL_SPEED;
    snowball.y += Math.sin(snowball.angle) * SNOWBALL_SPEED;
    snowball.timeLeft -= delta;

    for(const player of players){
      if(player.id == snowball.playerId) continue;
      let  distance = Math.sqrt((player.x + 8 -snowball.x)**2 + (player.y + 8 - snowball.y)**2);
      if(distance <= 8){
        player.x = 0;
        player.y = 0;
        snowball.timeLeft = -1;
        break;
      }
    }
  }
  snowballs = snowballs.filter((snowball) => snowball.timeLeft > 0);

  io.emit("players", players);
  io.emit("snowballs", snowballs);
}

async function main() {
  const map2D = await loadMap();
  io.on("connect", (socket) => {
    console.log(socket.id);
    socket.emit("map", map2D);

    inputsMap[socket.id] = {
      up: false,
      down: false,
      right: false,
      left: false,
    };
    players.push({
      id: socket.id,
      x: 0,
      y: 0,
    });
    socket.on("inputs", (inputs) => {
      inputsMap[socket.id] = inputs;
    });

    socket.on("snowballAngle", (angle) => {
      const player = players.find((player) => player.id === socket.id);
      snowballs.push({
        angle,
        x: player.x,
        y: player.y,
        timeLeft: 1000,
        playerId: socket.id
      });
    });

    socket.on("disconnect", () => {
      players = players.filter((player) => player.id != socket.id);
    });
  });
  app.use(express.static("public"));

  httpServer.listen(3000, () => {
    console.log("Server running");
  });
  let lastUpdated = Date.now();
  setInterval(() => {
    let now = Date.now();
    let delta = now - lastUpdated;
    lastUpdated = now;

    tick(delta);
  }, 1000 / TICK_RATE);
}

main();
