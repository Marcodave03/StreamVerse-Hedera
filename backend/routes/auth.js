import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import {
  PrivateKey,
  Client,
  AccountCreateTransaction,
  Hbar,
  AccountBalanceQuery,
} from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const client = Client.forTestnet();
client.setOperator(
  process.env.HEDERA_ACCOUNT_ID,
  process.env.HEDERA_PRIVATE_KEY
);

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const privateKey = PrivateKey.generate();
    const publicKey = privateKey.publicKey;

    const transactionResponse = await new AccountCreateTransaction()
      .setKey(publicKey)
      .setInitialBalance(new Hbar(10))
      .execute(client);

    const receipt = await transactionResponse.getReceipt(client);
    const hederaAccountId = receipt.accountId.toString();

    const user = await User.create({
      username,
      password,
      hederaAccountId,
      hederaPrivateKey: privateKey.toString(),
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/balance", async (req, res) => {
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
});

router.get("/account", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: ["username", "hederaAccountId"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      username: user.username,
      hederaAccountId: user.hederaAccountId,
    });
  } catch (error) {
    console.error("Error fetching account info:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/logout", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await BlacklistedToken.create({ token });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
