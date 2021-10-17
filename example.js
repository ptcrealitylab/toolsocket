const ToolSocket = require("./index.js");
let server = new ToolSocket.Io.Server({port: 123});
let io = new ToolSocket.Io();
let client = io.connect("ws://localhost:123/n/xkjhasdflk");

console.log(client.connected);

client.on("connect", () => {
    client.emit("/", "client says Hi");
    client.on("/", (m) => console.log("client: ", m))
    console.log(client.connected);
})

server.on('connection', (io) => {
    io.on("/", (m) => console.log("server: ", m))
    io.emit("/", "server says Hi");
    console.log(io.connected)
});