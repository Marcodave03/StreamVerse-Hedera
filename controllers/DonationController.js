import { Client, TransferTransaction, Hbar } from "@hashgraph/sdk";
import User from "../models/User.js";
import Donations from "../models/Donation.js";

export const donate = async (req, res) => {
  const { receiverAccountId, amount, senderAccountId, streamId } = req.body;

  if (!receiverAccountId || !amount || !senderAccountId || !streamId) {
    return res.status(400).send({
      error:
        "Sender account ID, receiver account ID, amount, and stream ID are required.",
    });
  }

  try {
    const sender = await User.findOne({
      where: { hederaAccountId: senderAccountId },
    });

    if (!sender) {
      return res.status(400).send({ error: "Sender account not found." });
    }

    const receiver = await User.findOne({
      where: { hederaAccountId: receiverAccountId },
    });

    if (!receiver) {
      return res.status(400).send({ error: "Receiver account not found." });
    }

    const client = Client.forTestnet();

    const transaction = new TransferTransaction()
      .addHbarTransfer(senderAccountId, new Hbar(-amount))
      .addHbarTransfer(receiverAccountId, new Hbar(amount));

    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);

    const donation = await Donations.create({
      sender_id: sender.id,
      receiver_id: receiver.id,
      stream_id: streamId,
      amount: amount,
      timestamps: new Date(),
    });

    res.status(200).send({
      message: "Donation successful",
      transactionStatus: receipt.status.toString(),
      donation,
    });
  } catch (error) {
    console.error("Error during donation:", error);
    res.status(500).send({ error: error.message });
  }
};

export default {
  donate,
};
