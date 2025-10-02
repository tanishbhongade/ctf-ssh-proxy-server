const { Client } = require("ssh2");
const WebSocket = require("ws");
const url = require("url");

const wss = new WebSocket.Server({ port: 8083 });

wss.on("connection", (ws, req) => {
  const params = url.parse(req.url, true).query;
  const host = params.host
  const port = parseInt(params.port, 10)
  const username = params.user
  const password = params.pass

  const ssh = new Client();

  ssh.on("ready", () => {
    ssh.shell((err, stream) => {
      if (err) {
        ws.send(`SSH error: ${err.message}\r\n`);
        ws.close();
        return;
      }

      stream.on("data", (data) => ws.send(data.toString()));
      stream.stderr.on("data", (data) => ws.send(data.toString()));

      ws.on("message", (msg) => stream.write(msg));

      ws.on("close", () => ssh.end());
    });
  }).on("error", (err) => {
    ws.send(`SSH connection error: ${err.message}\r\n`);
    ws.close();
  }).connect({
    host,
    port,
    username,
    password,
  });
});

console.log("SSH WebSocket proxy running on ws://localhost:8083");
