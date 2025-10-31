// model/Producto.js
import mongoose from "mongoose";

const productoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    price: { type: Number, min: 0 },
    price_text: { type: String, trim: true },
    unit_price_text: { type: String, trim: true },
    image: { type: String, trim: true },
    link: { type: String, trim: true },
    category: { type: String, trim: true, lowercase: true },
    subcategory: { type: String, trim: true, lowercase: true },
    source_file: { type: String, trim: true },

    // ---- Para nota ----
    is_discounted: { type: Boolean, default: false },
    discounted_price: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

productoSchema.index({ price: 1 });
productoSchema.index({ title: "text", category: "text", subcategory: "text" });

export default mongoose.model("Producto", productoSchema);

