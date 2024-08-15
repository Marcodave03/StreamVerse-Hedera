import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { Client, PrivateKey, TransferTransaction, Hbar } from "@hashgraph/sdk";
import sequelize from "./models/index.js";
import authRoute from "./routes/auth.js";
import User from "./models/user.js"; // Assuming you have a User model to fetch user details

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(bodyParser.json());

sequelize
  .sync()
  .then(() => {
    console.log("Database synchronized successfully.");
  })
  .catch((error) => {
    console.error("Error synchronizing database:", error);
  });

app.post("/donate", async (req, res) => {
  const { receiverAccountId, amount, senderAccountId } = req.body;

  if (!receiverAccountId || !amount || !senderAccountId) {
    return res.status(400).send({
      error: "Sender account ID, receiver account ID, and amount are required.",
    });
  }

  try {
    // Fetch the user from the database using the senderAccountId
    const user = await User.findOne({
      where: { hederaAccountId: senderAccountId },
    });

    if (!user) {
      return res.status(400).send({ error: "Sender account not found." });
    }

    // Initialize the client with the correct sender's account ID and private key
    const client = Client.forTestnet();
    client.setOperator(
      senderAccountId,
      PrivateKey.fromString(user.hederaPrivateKey)
    );

    const transaction = new TransferTransaction()
      .addHbarTransfer(senderAccountId, new Hbar(-amount)) // Sender
      .addHbarTransfer(receiverAccountId, new Hbar(amount)); // Receiver

    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);

    res.status(200).send({
      message: "Donation successful",
      transactionStatus: receipt.status.toString(),
    });
  } catch (error) {
    console.error("Error during donation:", error);
    res.status(500).send({ error: error.message });
  }
});

app.use("/auth", authRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
