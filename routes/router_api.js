// routes/router_api.js
import express from "express";
import mongoose from "mongoose";
import Producto from "../model/Producto.js";
// import soloAdmin from "../middlewares/soloAdmin.js"; // opcional si quieres proteger mutaciones

const router = express.Router();

// Utils
const isValidObjectId = id => mongoose.Types.ObjectId.isValid(id);

/**
 * @openapi
 * /api/productos:
 *   get:
 *     summary: Lista productos
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Búsqueda por texto
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 100 }
 *       - in: query
 *         name: skip
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: Lista de productos
 */
// --- GET /api/productos  (todos) ---
router.get("/productos", async (req, res, next) => {
  try {
    const { q, limit = 100, skip = 0 } = req.query;
    const lim = Math.max(1, Math.min(200, parseInt(limit, 10)));
    const skp = Math.max(0, parseInt(skip, 10));

    const filter = q
      ? {
          $or: [
            { title: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
            { category: new RegExp(q, "i") },
            { subcategory: new RegExp(q, "i") }
          ]
        }
      : {};

    const [items, total] = await Promise.all([
      Producto.find(filter).skip(skp).limit(lim),
      Producto.countDocuments(filter)
    ]);

    res.json({ total, count: items.length, items });
  } catch (e) { next(e); }
});

/**
 * @openapi
 * /api/productos/{id}:
 *   get:
 *     summary: Obtiene un producto por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Producto no encontrado
 */
// --- GET /api/productos/:id ---
router.get("/productos/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "ID inválido" });
    const prod = await Producto.findById(id);
    if (!prod) return res.status(404).json({ error: "No encontrado" });
    res.json(prod);
  } catch (e) { next(e); }
});
// Alias singular por compatibilidad: /api/producto/:id
router.get("/producto/:id", (req, res, next) => router.handle({ ...req, url: `/productos/${req.params.id}` }, res, next));

/**
 * @openapi
 * /api/productos:
 *   post:
 *     summary: Crea un nuevo producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               price: { type: number }
 *               price_text: { type: string }
 *               unit_price_text: { type: string }
 *               image: { type: string }
 *               link: { type: string }
 *               category: { type: string }
 *               subcategory: { type: string }
 *     responses:
 *       201:
 *         description: Producto creado
 *       422:
 *         description: Datos inválidos
 */
// --- POST /api/productos (crear) ---
// router.post("/productos", soloAdmin, async (req, res, next) => {
router.post("/productos", async (req, res, next) => {
  try {
    // Validación mínima
    const { title, price, price_text, unit_price_text, image, link, category, subcategory } = req.body;
    if (!title) return res.status(422).json({ error: "title es obligatorio" });
    if (price != null && (typeof price !== "number" || price < 0))
      return res.status(422).json({ error: "price debe ser número >= 0" });

    const created = await Producto.create({
      title, price, price_text, unit_price_text, image, link, category, subcategory
    });
    res.status(201).json(created);
  } catch (e) { next(e); }
});

/**
 * @openapi
 * /api/productos/{id}:
 *   put:
 *     summary: Actualiza el precio de un producto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price: { type: number }
 *               discounted_price: { type: number }
 *               is_discounted: { type: boolean }
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Producto no encontrado
 *       422:
 *         description: Datos inválidos
 */
// --- PUT /api/productos/:id (actualizar precio) ---
// router.put("/productos/:id", soloAdmin, async (req, res, next) => {
router.put("/productos/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "ID inválido" });

    const { price, discounted_price, is_discounted } = req.body;
    const update = {};
    if (price != null) {
      if (typeof price !== "number" || price < 0) return res.status(422).json({ error: "price inválido" });
      update.price = price;
    }
    if (discounted_price != null) {
      if (typeof discounted_price !== "number" || discounted_price < 0)
        return res.status(422).json({ error: "discounted_price inválido" });
      update.discounted_price = discounted_price;
    }
    if (is_discounted != null) update.is_discounted = !!is_discounted;

    const updated = await Producto.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: "No encontrado" });
    res.json(updated);
  } catch (e) { next(e); }
});
// Alias singular: /api/producto/:id
router.put("/producto/:id", (req, res, next) => router.handle({ ...req, url: `/productos/${req.params.id}` }, res, next));

/**
 * @openapi
 * /api/productos/{id}:
 *   delete:
 *     summary: Elimina un producto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Producto eliminado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Producto no encontrado
 */
// --- DELETE /api/productos/:id ---
// router.delete("/productos/:id", soloAdmin, async (req, res, next) => {
router.delete("/productos/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "ID inválido" });
    const out = await Producto.findByIdAndDelete(id);
    if (!out) return res.status(404).json({ error: "No encontrado" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});
// Alias singular:
router.delete("/producto/:id", (req, res, next) => router.handle({ ...req, url: `/productos/${req.params.id}` }, res, next));

export default router;
