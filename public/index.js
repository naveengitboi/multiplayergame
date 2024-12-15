const mapImage = new Image();
mapImage.src = "/snowy-sheet.png";

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

function resizeWindow() {
  canvasEle.width = window.innerWidth;
  canvasEle.height = window.innerHeight;
}

function loop() {
  window.addEventListener("resize", resizeWindow);
  ctx.clearRect(0, 0, canvasEle.width, canvasEle.height);
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
        col * TILE_SIZE,
        row * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE,
      );
    }
  }
  window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);
