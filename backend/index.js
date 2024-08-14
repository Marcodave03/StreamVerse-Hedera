import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { Client, PrivateKey, TransferTransaction, Hbar } from "@hashgraph/sdk";
import sequelize from "./models/index.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(bodyParser.json());

// Initialize the database connection
sequelize.sync();

// Hedera client setup
const client = Client.forTestnet(); // or Client.forMainnet() for production
client.setOperator(
  process.env.HEDERA_ACCOUNT_ID,
  process.env.HEDERA_PRIVATE_KEY
);

// Donation route
app.post("/donate", async (req, res) => {
  const { receiverAccountId, amount } = req.body;
  try {
    const transaction = new TransferTransaction()
      .addHbarTransfer(process.env.HEDERA_ACCOUNT_ID, new Hbar(-amount))
      .addHbarTransfer(receiverAccountId, new Hbar(amount));

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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
