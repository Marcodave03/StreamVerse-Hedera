import { TransferTransaction, Hbar } from "@hashgraph/sdk";
import client from "../config/hederaClient.js";

const myAccountId = process.env.MY_ACCOUNT_ID;

async function donateHbar(receiverAccountId, amount) {
  try {
    if (!receiverAccountId || !amount) {
      throw new Error("Invalid receiverAccountId or amount");
    }

    const transaction = new TransferTransaction()
      .addHbarTransfer(myAccountId, new Hbar(-amount))
      .addHbarTransfer(receiverAccountId, new Hbar(amount));

    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);

    return receipt.status.toString();
  } catch (error) {
    console.error("Error executing donation transaction:", error);
    throw error;
  }
}

export default donateHbar;
