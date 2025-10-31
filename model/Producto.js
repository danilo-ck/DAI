// ./model/Producto.js
import mongoose from "mongoose";

const productoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: false, min: 0 },         // algunos productos pueden no traer precio
    price_text: { type: String, trim: true },
    unit_price_text: { type: String, trim: true },
    image: { type: String, trim: true },
    link: { type: String, trim: true },
    category: { type: String, trim: true, lowercase: true },
    subcategory: { type: String, trim: true, lowercase: true },
    source_file: { type: String, trim: true }
  },
  { timestamps: true }
);

// Índices útiles para consultas
productoSchema.index({ price: 1 });
productoSchema.index({ title: "text", category: "text", subcategory: "text" });

const Producto = mongoose.model("Producto", productoSchema);
export default Producto;
