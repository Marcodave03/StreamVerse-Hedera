import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import db from "./config/database.js";
import UserRouter from "./routes/userRoutes.js";
import StreamingRouter from "./routes/streamingRoutes.js";
import { initializeSocketIO } from "./controllers/streamingController.js";
import authRouter from "./routes/authRoute.js";
import donationRouter from "./routes/donationRoute.js";


dotenv.config();

const app = express();
const server = http.createServer(app);
initializeSocketIO(server);

app.use(cors());
app.use(express.json());

app.use(UserRouter);
app.use(StreamingRouter);
app.use(authRouter);
app.use(donationRouter);

const port = process.env.PORT || 5080;
server.listen(port, () => console.log(`Server running on port ${port}`));