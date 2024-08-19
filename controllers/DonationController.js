import { Client, TransferTransaction, Hbar } from "@hashgraph/sdk";
import User from "../models/User.js";
import Streams from "../models/Stream.js";
import Donations from "../models/Donation.js";

export const donateToStreamer = async (req, res) => {
  const { amount, senderAccountId, streamId } = req.body;
  console.log(amount, senderAccountId, streamId);
  if (!amount || !senderAccountId || !streamId) {
    return res.status(400).send({
      error: "Sender account ID, amount, and stream ID are required.",
    });
  }

  try {
    // Find the stream and the associated receiver
    const stream = await Streams.findOne({
      where: { stream_url: streamId }, // Assuming stream_url is the roomId
      include: [{ model: User, as: "user" }],
    });

    if (!stream) {
      return res.status(400).send({ error: "Stream not found." });
    }

    const receiverAccountId = stream.user.hederaAccountId; // Get the receiver's account ID

    const sender = await User.findOne({
      where: { hederaAccountId: senderAccountId },
    });

    if (!sender) {
      return res.status(400).send({ error: "Sender account not found." });
    }

    // Log the Sender and Receiver Account IDs
    console.log("Sender Account ID:", senderAccountId);
    console.log("Receiver Account ID:", receiverAccountId);
    console.log("Stream ID (Room ID):", streamId);

    const client = Client.forTestnet();
    client.setOperator(senderAccountId, sender.hederaPrivateKey);

    const transaction = new TransferTransaction()
      .addHbarTransfer(senderAccountId, new Hbar(-amount))
      .addHbarTransfer(receiverAccountId, new Hbar(amount))
      .freezeWith(client);

    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);

    const donation = await Donations.create({
      sender_id: sender.id,
      receiver_id: stream.user.id, // Use the stream's user ID as the receiver
      stream_id: stream.id,
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

export const getReceiverAccountId = async (req, res) => {
  const { roomId } = req.params; // Get the roomId (streamId) from the request parameters
  try {
    // Find the stream based on the stream_url (which is the roomId)
    const stream = await Streams.findOne({
      where: { topic_id: roomId },
      include: [{ model: User, as: "user" }], // Include the user associated with the stream
    });
    
    if (!stream) {
      return res.status(404).json({ error: "Stream not found." });
    }

    // Extract the receiver's Hedera Account ID from the user associated with the stream
    const receiverAccountId = stream.user.hederaAccountId;

    // Return the receiver's account ID in the response
    res.json({ receiverAccountId });
  } catch (error) {
    console.error("Error fetching receiver account ID:", error);
    res.status(500).json({ error: "Failed to fetch receiver account ID." });
  }
};

export default {
  donateToStreamer,
  getReceiverAccountId,
};
