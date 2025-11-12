// routes/router_admin.js
import express from "express";
import soloAdmin from "../middlewares/soloAdmin.js";

const router = express.Router();

// TODO: Funcionalidad de cambiar precio pendiente de implementación
router.get("/precio/:id", soloAdmin, (req, res) => {
  res.status(501).send("Funcionalidad no implementada todavía");
});

export default router;
