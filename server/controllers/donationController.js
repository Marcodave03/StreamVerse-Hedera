// src/controllers/donationController.js
import { Client, PrivateKey, TransferTransaction, Hbar } from "@hashgraph/sdk";
import User from "../models/userModel.js";
import client from "../config/hederaClient.js";

export const donate = async (req, res) => {
  const { receiverAccountId, amount, senderAccountId } = req.body;

  if (!receiverAccountId || !amount || !senderAccountId) {
    return res.status(400).send({
      error: "Sender account ID, receiver account ID, and amount are required.",
    });
  }

  try {
    const user = await User.findOne({
      where: { hederaAccountId: senderAccountId },
    });

    if (!user) {
      return res.status(400).send({ error: "Sender account not found." });
    }

    const senderClient = Client.forTestnet();
    senderClient.setOperator(
      senderAccountId,
      PrivateKey.fromString(user.hederaPrivateKey)
    );

    const transaction = new TransferTransaction()
      .addHbarTransfer(senderAccountId, new Hbar(-amount)) // Sender
      .addHbarTransfer(receiverAccountId, new Hbar(amount)); // Receiver

    const txResponse = await transaction.execute(senderClient);
    const receipt = await txResponse.getReceipt(senderClient);

    res.status(200).send({
      message: "Donation successful",
      transactionStatus: receipt.status.toString(),
    });
  } catch (error) {
    console.error("Error during donation:", error);
    res.status(500).send({ error: error.message });
  }
};

export default donate;