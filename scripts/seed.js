// seed.js
import fs from "fs/promises";
import mongoose from "mongoose";

import connectDB from "../model/db.js";
import Producto from "../model/Producto.js";

async function main() {
  await connectDB();

  // Lee el JSON con los productos parseados en la práctica 1.1
  const raw = await fs.readFile("../datos_mercadona.json", "utf8");
  const lista = JSON.parse(raw);

  // (Opcional) Mapeo/normalización por seguridad
  const normalizados = lista.map((p) => ({
    title: p.texto_1 ?? p.title ?? null,
    price: typeof p.precio_euros === "number" ? p.precio_euros : (typeof p.price === "number" ? p.price : null),
    price_text: p.texto_precio ?? p.price_text ?? null,
    unit_price_text: p.texto_2 ?? p.unit_price_text ?? null,
    image: p.url_img ?? p.image ?? null,
    link: p.link ?? null,
    category: p.categoría ?? p.category ?? null,
    subcategory: p.subcategoría ?? p.subcategory ?? null,
    source_file: p.source_file ?? null
  })).filter(p => p.title); // exigimos al menos título

  try {
    // Limpia colección si quieres empezar de cero
    await Producto.deleteMany({});
    const insertados = await Producto.insertMany(normalizados, { ordered: false });
    console.log(`✔ Insertados ${insertados.length} documentos`);
  } catch (error) {
    console.error("Error insertando:", error.message);
  } finally {
    await mongoose.connection.close();
  }
}

main().catch(async (e) => {
  console.error(e);
  await mongoose.connection.close();
  process.exit(1);
});
