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
const loadMap = require('./mapLoader');

async function main() {
  const map2D = await loadMap();
  io.on("connect", (socket) => {
    console.log(socket.id);
    socket.emit("map", map2D);
  });
  app.use(express.static("public"));

  httpServer.listen(3000, () => {
    console.log("Server running");
  });
}

main();
