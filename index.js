import dotenv from "dotenv";
import express from "express";
import {
  Client,
  PrivateKey,
  AccountId,
  TransferTransaction,
  Hbar,
} from "@hashgraph/sdk";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());

const myAccountId = process.env.HEDERA_ACCOUNT_ID;
const myPrivateKey = process.env.HEDERA_PRIVATE_KEY;

if (!myAccountId || !myPrivateKey) {
  throw new Error("Account ID and private key must be provided");
}

const client = Client.forTestnet();
client.setOperator(
  AccountId.fromString(myAccountId),
  PrivateKey.fromString(myPrivateKey)
);

app.post("/donate", async (req, res) => {
  const { recipientAccountId, amount } = req.body;

  if (!recipientAccountId || !amount) {
    return res
      .status(400)
      .json({ error: "Recipient account ID and amount are required" });
  }

  try {
    const transaction = new TransferTransaction()
      .addHbarTransfer(myAccountId, new Hbar(-amount))
      .addHbarTransfer(recipientAccountId, new Hbar(amount));

    const txResponse = await transaction.execute(client);

    const receipt = await txResponse.getReceipt(client);

    res.json({
      status: "success",
      transactionId: txResponse.transactionId.toString(),
      receipt,
    });
  } catch (error) {
    console.error("Error processing donation:", error);
    res.status(500).json({ error: "Failed to process donation" });
  }
});

app.listen(port, () => {
  console.log(`Donation server listening at http://localhost:${port}`);
});
