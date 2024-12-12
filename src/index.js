const express = require("express");
const {createServer} = require('http');
const {server} = require('socket.io');

const app = express();

const httpServer = createServer(app);

const io = new server(httpServer, {});

io.on("connection", (socket) => {
    console.log(socket);
})

httpServer.listen(3000, () => {
    console.log('Server running');
})
