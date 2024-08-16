import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";

// Models

// import Donations from "./models/Donation.js";
// import Profiles from "./models/Profile.js";
// import User from "./models/User.js";
// import Streams from "./models/Stream.js";

// Routes
import AuthRoute from "./routes/AuthRoute.js";
import AccountRoute from "./routes/AccountRoute.js";
import DonationRoute from "./routes/DonationRoute.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Model Sync

// User.sync();
// Profiles.sync();
// Streams.sync();
// Donations.sync();

// Use Route with prefix
app.use("/auth", AuthRoute);
app.use("/account", AccountRoute);
app.use("/", DonationRoute);

const port = process.env.PORT;
if (!port) {
  console.error("Port is not defined in the environment variables");
  process.exit(1);
}

server.listen(port, () => console.log(`Server running on port ${port}`));
