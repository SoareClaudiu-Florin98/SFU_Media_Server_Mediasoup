import express from "express";
import * as http from "http";
import * as WebSocket from "ws";
import { webSocketConnection } from "./utils";

const main = async () => {
  const app = express();
  const server = http.createServer(app);
  const websocket = new WebSocket.Server({ server, path: "/ws" });

  webSocketConnection(websocket);

  const port = process.env.PORT || 8000;

  server.listen(port, () => {
    console.log("Server started on port 8000");
  });
};

export { main };
