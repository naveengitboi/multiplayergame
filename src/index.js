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


const inputsMap = {}
const players = [];
const TICK_RATE = 30;
const SPEED = 5;

function tick(){
  for(const player of players){
    const inputs = inputsMap[player.id];
    if(inputs.up){
      player.y -= SPEED;
    }else if(inputs.down){
      player.y += SPEED;
    }

    if(inputs.right){
      player.x += SPEED;
    }else if(inputs.left){
      player.x -= SPEED;
    }

  }


  io.emit("players", players);
}

async function main() {
  const map2D = await loadMap();
  io.on("connect", (socket) => {
    console.log(socket.id);
    socket.emit("map", map2D);

    inputsMap[socket.id] = {
    "up":false,
    "down": false,
    "right":false,
    "left": false,
    }
    players.push({
      id: socket.id,
      x: 0,
      y:0
    })
    socket.on("inputs", (inputs) => {
      inputsMap[socket.id] = inputs
    })
  });
  app.use(express.static("public"));

  httpServer.listen(3000, () => {
    console.log("Server running");
  });

  setInterval(tick, 1000/TICK_RATE);
}

main();
