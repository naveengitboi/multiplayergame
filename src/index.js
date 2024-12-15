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
const TILE_SIZE = 32;
const SNOWBALL_SPEED = 8;
const PLAYER_SIZE = 32;
let ground2D, decals2D;

function isCollided(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.w &&
    rect1.x + rect1.w > rect2.x &&
    rect1.y < rect2.y + rect2.h &&
    rect1.h + rect1.y > rect2.y
  );
}

function isCollidingMap(player) {
  for (let row = 0; row < decals2D.length; row++) {
    for (let col = 0; col < decals2D[0].length; col++) {
      let tile = decals2D[row][col];
      if (
        tile &&
        isCollided(
          {
            x: player.x,
            y: player.y,
            w: TILE_SIZE,
            h: TILE_SIZE,
          },
          {
            x: col * TILE_SIZE,
            y: row * TILE_SIZE,
            w: TILE_SIZE,
            h: TILE_SIZE,
          },
        )
      ) {
        return true;
      }
    }
  }
  return false;
}

function tick(delta) {
  for (const player of players) {
    const inputs = inputsMap[player.id];
    let previousX = player.x;
    let previousY = player.y;
    if (inputs.up) {
      player.y -= SPEED;
    } else if (inputs.down) {
      player.y += SPEED;
    }
    if (isCollidingMap(player)) {
      player.y = previousY;
    }

    if (inputs.right) {
      player.x += SPEED;
    } else if (inputs.left) {
      player.x -= SPEED;
    }

    if (isCollidingMap(player)) {
      player.x = previousX;
    }
  }

  for (const snowball of snowballs) {
    snowball.x += Math.cos(snowball.angle) * SNOWBALL_SPEED;
    snowball.y += Math.sin(snowball.angle) * SNOWBALL_SPEED;
    snowball.timeLeft -= delta;

    for (const player of players) {
      if (player.id == snowball.playerId) continue;
      let distance = Math.sqrt(
        (player.x + PLAYER_SIZE / 2 - snowball.x) ** 2 +
        (player.y + PLAYER_SIZE / 2 - snowball.y) ** 2,
      );
      if (distance <= PLAYER_SIZE / 2) {
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
  ({ ground2D, decals2D } = await loadMap());
  io.on("connect", (socket) => {
    console.log(socket.id);
    socket.emit("map", {
      ground: ground2D,
      decals: decals2D,
    });

    inputsMap[socket.id] = {
      up: false,
      down: false,
      right: false,
      left: false,
    };
    players.push({
      id: socket.id,
      x: 400,
      y: 300,
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
        playerId: socket.id,
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
