// consultas.js
import mongoose from "mongoose";
import connectDB from "./model/db.js";
import Producto from "./model/Producto.js";

const acciones = {
  async baratos() {
    // Productos de menos de 1 €
    const docs = await Producto.find({ price: { $lt: 1 } })
      .select({ title: 1, price: 1, unit_price_text: 1, category: 1, subcategory: 1 })
      .sort({ price: 1 })
      .limit(100);
    imprime("Productos < 1€", docs);
  },

  async "baratos-no-agua"() {
    // Productos < 1 € que NO sean agua (título que no contenga "agua")
    const docs = await Producto.find({
      price: { $lt: 1 },
      title: { $not: /agua/i }
    })
      .select({ title: 1, price: 1, unit_price_text: 1, category: 1, subcategory: 1 })
      .sort({ price: 1 })
      .limit(100);
    imprime("Productos < 1€ (excluye agua)", docs);
  },

  async aceites() {
    // Aceites ordenados por precio (busca por categoría 'aceites' o título que contenga "aceite")
    const docs = await Producto.find({
      $or: [
        { category: /aceit/i },
        { title: /aceite/i }
      ]
    })
      .select({ title: 1, price: 1, unit_price_text: 1, category: 1, subcategory: 1 })
      .sort({ price: 1 })
      .limit(100);
    imprime("Aceites (ordenado por precio)", docs);
  },

  async garrafa() {
    // Productos en garrafa (heurística por texto)
    const docs = await Producto.find({
      $or: [
        { title: /garrafa/i },
        { unit_price_text: /garrafa/i }
      ]
    })
      .select({ title: 1, price: 1, unit_price_text: 1, category: 1, subcategory: 1 })
      .sort({ price: 1 })
      .limit(100);
    imprime("Productos en garrafa", docs);
  }
};

function imprime(titulo, docs) {
  console.log(`\n=== ${titulo} (n=${docs.length}) ===`);
  for (const d of docs) {
    const p = (typeof d.price === "number") ? `${d.price.toFixed(2)} €` : d.price_text || "s/p";
    console.log(`- ${d.title}  |  ${p}  |  ${d.unit_price_text ?? ""}  |  [${d.category ?? ""}/${d.subcategory ?? ""}]`);
  }
}

async function main() {
  await connectDB();

  const accion = process.argv[2]; // baratos | baratos-no-agua | aceites | garrafa
  if (!accion) {
    // ejecuta todas por defecto
    for (const key of Object.keys(acciones)) {
      await acciones[key]();
    }
  } else if (acciones[accion]) {
    await acciones[accion]();
  } else {
    console.log("Acciones válidas: baratos | baratos-no-agua | aceites | garrafa");
  }

  await mongoose.connection.close();
}

main().catch(async (e) => {
  console.error(e);
  await mongoose.connection.close();
  process.exit(1);
});
