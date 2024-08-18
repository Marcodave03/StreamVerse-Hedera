import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import { initializeSocketIO } from "./controllers/StreamingController.js";

// Routes
import AuthRoute from "./routes/AuthRoute.js";
import AccountRoute from "./routes/AccountRoute.js";
import DonationRoute from "./routes/DonationRoute.js";
import StreamingRouter from "./routes/StreamingRoute.js";
import FollowerRoute from "./routes/FollowerRoute.js";
import UserRoute from "./routes/UserRoute.js";

dotenv.config();

// User.sync();
// Profiles.sync();
// Streams.sync();
// Donations.sync();

const app = express();
const server = http.createServer(app);
initializeSocketIO(server);

app.use(cors());
app.use(express.json());

// Use Route with prefix
app.use("/auth", AuthRoute);
app.use("/account", AccountRoute);
app.use("/stream", StreamingRouter);
app.use("/follower", FollowerRoute);
app.use("/user", UserRoute);
app.use("/", DonationRoute);
app.use("/followers", FollowerRoute);

const port = process.env.PORT;
if (!port) {
  console.error("Port is not defined in the environment variables");
  process.exit(1);
}

server.listen(port, () => console.log(`Server running on port ${port}`));
