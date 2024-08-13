// src/socket.ts
import { io } from "socket.io-client";

const socket = io("http://localhost:5080", {
  transports: ["websocket", "polling"],
});

export default socket;
