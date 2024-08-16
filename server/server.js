import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import db from "./config/database.js";
import UserRouter from "./routes/userRoutes.js";
import StreamingRouter from "./routes/streamingRoutes.js";
import authRouter from "./routes/authRoute.js";
import donationRouter from "./routes/donationRoute.js";
import { initializeSocketIO } from "./controllers/streamingController.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
initializeSocketIO(server);

app.use(cors());
app.use(express.json());

app.use(UserRouter);
app.use(StreamingRouter);

const port = process.env.PORT || 5080;
server.listen(port, () => console.log(`Server running on port ${port}`));
