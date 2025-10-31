// ./model/db.js
import mongoose from "mongoose";

// Puedes parametrizar con env: MONGO_URL="mongodb://root:example@localhost:27017/DAI?authSource=admin"
const url = process.env.MONGO_URL || "mongodb://root:example@localhost:27017/DAI?authSource=admin";

export default async function connectDB() {
  try {
    await mongoose.connect(url, {
      // opciones modernas por defecto; mongoose 8 optimiza esto
    });
  } catch (err) {
    console.error("Error conectando a MongoDB:", err.message);
    process.exit(1);
  }

  const db = mongoose.connection;

  db.once("open", () => {
    console.log(`✔ Database connected: ${url}`);
  });

  db.on("error", (err) => {
    console.error("connection error:", err);
  });
}
