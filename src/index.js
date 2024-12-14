const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
    },
});

io.on("connect", (socket) => {
    console.log(socket.id);
});

app.use(express.static("public"));

httpServer.listen(3000, () => {
    console.log("Server running");
});
