// model/db.js
import mongoose from "mongoose";

const USER_DB = process.env.USER_DB;
const PASS = process.env.PASS;

const MONGO_HOST = process.env.MONGO_HOST || "localhost";
const MONGO_PORT = process.env.MONGO_PORT || "27017";
const MONGO_DB = process.env.MONGO_DB || "DAI";

const url = `mongodb://${USER_DB}:${PASS}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

export default async function connectDB() {
  try {
    await mongoose.connect(url);
  } catch (err) {
    console.error("Error conectando a MongoDB:", err.message);
    process.exit(1);
  }
  const db = mongoose.connection;
  db.once("open", () => console.log(`✔ DB conectada: ${url}`));
  db.on("error", (err) => console.error("Mongo error:", err));
}

