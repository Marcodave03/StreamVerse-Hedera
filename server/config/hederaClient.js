import { Client, AccountId, PrivateKey } from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
  console.error(
    "HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be set in the .env file"
  );
  process.exit(1);
}

const myAccountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
const myPrivateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);

const client = Client.forTestnet();

client.setOperator(myAccountId, myPrivateKey);

export default client;
