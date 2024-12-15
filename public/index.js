const mapImage = new Image();
mapImage.src = "/snowy-sheet.png";

const santaImage = new Image();
santaImage.src = "/santa.png";
const canvasEle = document.getElementById("canvas");

const ctx = canvasEle.getContext("2d");
canvasEle.width = window.innerWidth;
canvasEle.height = window.innerHeight;

const socket = io("ws://localhost:3000");

socket.on("connect", (response) => {
  console.log("Connectd", response);
});

let map = [[]];
const TILE_SIZE = 16;
const TILES_IN_ROW = 8;

socket.on("map", (loadedMap) => {
  map = loadedMap;
});

let players = [];
socket.on("players", (serverPlayers) => {
  players = serverPlayers;
});

function resizeWindow() {
  canvasEle.width = window.innerWidth;
  canvasEle.height = window.innerHeight;
}

//movemnets

const inputs = {
  up: false,
  down: false,
  right: false,
  left: false,
};

window.addEventListener("keydown", (e) => {
  let press = e.key;
  console.log(press);
  if (press == "w") {
    inputs["up"] = true;
  } else if (press == "d") {
    inputs["right"] = true;
  } else if (press == "s") {
    inputs["down"] = true;
  } else if (press == "a") {
    inputs["left"] = true;
  }
  socket.emit("inputs", inputs);
});

window.addEventListener("keyup", (e) => {
  const press = e.key.toLowerCase();
  if (press == "w") {
    inputs["up"] = false;
  } else if (press == "d") {
    inputs["right"] = false;
  } else if (press == "s") {
    inputs["down"] = false;
  } else if (press == "a") {
    inputs["left"] = false;
  }
  socket.emit("inputs", inputs);
});

function loop() {
  window.addEventListener("resize", resizeWindow);
  ctx.clearRect(0, 0, canvasEle.width, canvasEle.height);

  const myPlayer = players.find((player) => player.id === socket.id);

  let cameraX = 0;
  let cameraY = 0;
  if (myPlayer) {
    cameraX = parseInt(myPlayer.x - canvasEle.width / 2);
    cameraY = parseInt(myPlayer.y - canvasEle.height / 2);
  }
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[0].length; col++) {
      const { id } = map[row][col];
      const imageRow = parseInt(id / TILES_IN_ROW);
      const imageCol = parseInt(id % TILES_IN_ROW);
      ctx.drawImage(
        mapImage,
        imageCol * TILE_SIZE,
        imageRow * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE,
        col * TILE_SIZE - cameraX,
        row * TILE_SIZE - cameraY,
        TILE_SIZE,
        TILE_SIZE,
      );
    }
  }

  for (const eachPlayer of players) {
    ctx.drawImage(santaImage, eachPlayer.x - cameraX, eachPlayer.y - cameraY);
  }

  window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);
