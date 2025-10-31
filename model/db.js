// model/db.js
import mongoose from "mongoose";

const { USER_DB, PASS, HOST, DB_NAME } = process.env;

// Si están todas las variables de entorno, úsalas; sino, usa valores por defecto
const url = (USER_DB && PASS && HOST && DB_NAME) 
  ? `mongodb://${USER_DB}:${PASS}@${HOST}:27017/${DB_NAME}?authSource=admin`
  : process.env.MONGO_URL || "mongodb://root:example@localhost:27017/DAI?authSource=admin";

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

