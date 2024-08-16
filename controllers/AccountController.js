import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AccountBalanceQuery, Client } from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

const client = Client.forTestnet();

export const showUserBalance = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const accountBalance = await new AccountBalanceQuery()
      .setAccountId(user.hederaAccountId)
      .execute(client);

    res.status(200).json({ balance: accountBalance.hbars.toTinybars() });
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.status(500).json({ error: error.message });
  }
};

export const showUserHederaAccountId = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: ["email", "hederaAccountId"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      email: user.email,
      hederaAccountId: user.hederaAccountId,
    });
  } catch (error) {
    console.error("Error fetching account info:", error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  showUserBalance,
  showUserHederaAccountId,
};
