const socket = io("ws://localhost:3000");

socket.on("connect", (response) => {
  console.log("Connectd", response);
});


socket.on("map", (response) => {
  console.log(response)
})
