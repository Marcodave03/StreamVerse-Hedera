import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import UserRouter from "./routes/userRoutes.js";
import StreamingRouter from "./routes/streamingRoutes.js";
import { initializeSocketIO } from "./controllers/streamingController.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
initializeSocketIO(server);

app.use(cors());
app.use(express.json());

app.use(UserRouter);
app.use(StreamingRouter);

const port = process.env.PORT || 5080;
server.listen(port, () => console.log(`Server running on port ${port}`));
