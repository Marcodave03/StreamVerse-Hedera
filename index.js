import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import { initializeSocketIO } from "./controllers/StreamingController.js";
import sequelize from "./config/Database.js";

// Routes
import AuthRoute from "./routes/AuthRoute.js";
import AccountRoute from "./routes/AccountRoute.js";
import DonationRoute from "./routes/DonationRoute.js";
import StreamingRouter from "./routes/StreamingRoute.js";
import FollowerRoute from "./routes/FollowerRoute.js";
import UserRoute from "./routes/UserRoute.js";

// Models
import User from "./models/User.js";
import Profiles from "./models/Profile.js";
import Streams from "./models/Stream.js";
import Donations from "./models/Donation.js";

// Seeder
import { up as runSeeders } from "./seeders/users-profiles.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
initializeSocketIO(server);

app.use(cors());
app.use(express.json());

app.use("/auth", AuthRoute);
app.use("/account", AccountRoute);
app.use("/stream", StreamingRouter);
app.use("/follower", FollowerRoute);
app.use("/user", UserRoute);
app.use("/", DonationRoute);

const port = process.env.PORT;
if (!port) {
  console.error("Port is not defined in the environment variables");
  process.exit(1);
}

(async () => {
  try {
    // Sync models
    await User.sync();
    await Profiles.sync();
    await Streams.sync();
    await Donations.sync();

    // Run seeder
    await runSeeders({
      bulkInsert: async (table, data, options) => {
        const queryInterface = sequelize.getQueryInterface();
        await queryInterface.bulkInsert(table, data, options);
      },
      bulkDelete: async (table, query, options) => {
        const queryInterface = sequelize.getQueryInterface();
        await queryInterface.bulkDelete(table, query, options);
      }
    });

    server.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (error) {
    console.error("Error starting server or seeding database:", error);
    process.exit(1);
  }
})();
