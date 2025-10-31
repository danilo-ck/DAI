// scripts/rebajas.js
import mongoose from "mongoose";
import connectDB from "../model/db.js";
import Producto from "../model/Producto.js";

await connectDB();

const filtro = { title: /aceite/i, price: { $gte: 3 } }; // ejemplo
const docs = await Producto.find(filtro).limit(5);
for (const d of docs) {
  const nuevo = Math.max(0, (d.price || 0) - 0.5);
  d.is_discounted = true;
  d.discounted_price = nuevo;
  await d.save();
  console.log(`Rebajado: ${d.title} -> ${nuevo}€`);
}

await mongoose.connection.close();
