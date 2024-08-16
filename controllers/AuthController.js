import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  PrivateKey,
  Client,
  AccountCreateTransaction,
  Hbar,
} from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();
const client = Client.forTestnet();

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const privateKey = PrivateKey.generate();
    const publicKey = privateKey.publicKey;

    const transactionResponse = await new AccountCreateTransaction()
      .setKey(publicKey)
      .setInitialBalance(new Hbar(100))
      .execute(client);

    const receipt = await transactionResponse.getReceipt(client);
    const hederaAccountId = receipt.accountId.toString();

    const user = await User.create({
      email,
      hashPassword,
      hederaAccountId,
      hederaPrivateKey: privateKey.toString(),
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error("Error during registration: ", error);
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

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
};

export const logout = async (req, res) => {
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
};

export default {
  register,
  login,
  logout,
};
