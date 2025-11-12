// routes/router_tienda.js
import express from "express";
import Producto from "../model/Producto.js";

const router = express.Router();

/* --------- helpers --------- */
function priceOf(product) {
  // respeta rebajas si existen
  if (product.is_discounted && product.discounted_price > 0) return product.discounted_price;
  if (typeof product.price === 'number') return product.price;
  return 0;
}

function recalc(cart) {
  cart.totalQty = cart.items.reduce((a, it) => a + it.qty, 0);
  cart.totalAmount = cart.items.reduce((a, it) => a + it.qty * it.price, 0);
}

/* --------- añadir al carro --------- */
// GET /al_carrito/:id
router.get("/al_carrito/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const prod = await Producto.findById(id).select("title price discounted_price is_discounted image");
    if (!prod) return res.status(404).send("Producto no encontrado");

    const cart = req.session.cart;
    const price = priceOf(prod);

    const existing = cart.items.find(it => it.id === String(prod._id));
    if (existing) {
      existing.qty += 1;
    } else {
      cart.items.push({
        id: String(prod._id),
        title: prod.title,
        price,                 // precio efectivo
        image: prod.image || null,
        qty: 1
      });
    }
    recalc(cart);
    // Redirige a la página anterior si viene de allí; si no, a /carrito
    res.redirect(req.get("Referer") || "/carrito");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error añadiendo al carrito");
  }
});

/* --------- ver carrito --------- */
// GET /carrito
router.get("/carrito", (req, res) => {
  res.render("carrito.html", {
    titulo: "Tu carrito",
    productos: req.session.cart.items,
    totalQty: req.session.cart.totalQty,
    totalAmount: req.session.cart.totalAmount
  });
});

/* --------- cambiar cantidad --------- */
// GET /carrito/cambiar/:id?op=inc|dec|set&qty=2
router.get("/carrito/cambiar/:id", (req, res) => {
  const { id } = req.params;
  const { op, qty } = req.query;
  const cart = req.session.cart;
  const it = cart.items.find(x => x.id === id);
  if (!it) return res.redirect("/carrito");

  if (op === "inc") it.qty += 1;
  else if (op === "dec") it.qty = Math.max(1, it.qty - 1);
  else if (op === "set") it.qty = Math.max(1, parseInt(qty || "1", 10));

  recalc(cart);
  res.redirect("/carrito");
});

/* --------- eliminar línea --------- */
// GET /carrito/eliminar/:id
router.get("/carrito/eliminar/:id", (req, res) => {
  const { id } = req.params;
  const cart = req.session.cart;
  cart.items = cart.items.filter(x => x.id !== id);
  recalc(cart);
  res.redirect("/carrito");
});

/* --------- vaciar --------- */
// GET /carrito/vaciar
router.get("/carrito/vaciar", (req, res) => {
  req.session.cart = { items: [], totalQty: 0, totalAmount: 0 };
  res.redirect("/carrito");
});

// Portada 
router.get("/", async (req, res) => {
  const productos = await Producto.aggregate([{ $sample: { size: 3 } }]);
  res.render("portada.html", { productos, titulo: "Tienda | Portada" });
});

// ---- BÚSQUEDA ----
router.get("/buscar", async (req, res) => {
  const q = (req.query.q || "").trim();
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = 24;
  const skip = (page - 1) * limit;

  if (!q) {
    return res.render("buscar.html", {
      titulo: "Buscar productos"
    });
  }

  // 1) Preferente: $text (rápido si hay índice de texto)
  // 2) Fallback: regex en varios campos (más flexible)
  const useText = true;
  let filter;

  if (useText) {
    filter = { $text: { $search: q } };
  } else {
    filter = {
      $or: [
        { title: new RegExp(q, "i") },
        { category: new RegExp(q, "i") },
        { subcategory: new RegExp(q, "i") }
      ]
    };
  }

  const [productos, total] = await Promise.all([
    Producto.find(filter)
      .sort(useText ? { score: { $meta: "textScore" } } : { price: 1 })
      .skip(skip)
      .limit(limit)
      .select(useText ? { score: { $meta: "textScore" } } : {}),
    Producto.countDocuments(filter)
  ]);

  const pages = Math.ceil(total / limit);

  res.render("lista.html", {
    productos,
    q,
    titulo: `Resultados para "${q}"`,
    page,
    total,
    pages
  });
});

export default router;
