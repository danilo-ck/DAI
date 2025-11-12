// routes/router_usuarios.js
import express from "express";
import jwt from "jsonwebtoken";
import Usuario from "../model/Usuario.js";

const router = express.Router();

// Helpers para emitir cookie con JWT
function signAndSetCookie(res, payload) {
  const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "7d" });
  res.cookie("access_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.IN === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7
  });
}

// ---------- Formularios ----------
router.get("/login", (req, res) => {
  res.render("login.html", { titulo: "Identificarse" });
});

router.get("/registro", (req, res) => {
  res.render("registro.html", { titulo: "Registro" });
});

// ---------- POST: Registro ----------
router.post("/registro", express.urlencoded({ extended: false }), async (req, res) => {
  const { username, email, password, password2 } = req.body;

  const errors = {};
  if (!username || username.trim().length < 3) errors.username = "Usuario demasiado corto";
  if (!password || password.length < 6) errors.password = "Mínimo 6 caracteres";
  if (password !== password2) errors.password2 = "Las contraseñas no coinciden";

  try {
    const exists = await Usuario.findOne({ username: username?.trim().toLowerCase() });
    if (exists) errors.username = "El usuario ya existe";
  } catch {}

  if (Object.keys(errors).length) {
    return res.status(422).render("registro.html", {
      titulo: "Registro",
      errors,
      values: { username, email }
    });
  }

  try {
    const user = await Usuario.create({
      username: username.trim().toLowerCase(),
      email: email?.trim().toLowerCase() || undefined,
      password
    });
    signAndSetCookie(res, { usuario: user.username, uid: String(user._id) });
    return res.redirect("/");
  } catch (e) {
    console.error(e);
    return res.status(500).render("registro.html", {
      titulo: "Registro",
      errors: { general: "Error creando usuario" },
      values: { username, email }
    });
  }
});

// ---------- POST: Login ----------
router.post("/login", express.urlencoded({ extended: false }), async (req, res) => {
  const { username, password } = req.body;
  const errors = {};

  if (!username || !password) {
    errors.general = "Introduce usuario y contraseña";
    return res.status(400).render("login.html", { titulo: "Identificarse", errors, values: { username } });
  }

  try {
    const user = await Usuario.findOne({ username: username.trim().toLowerCase() });
    if (!user) {
      errors.general = "Credenciales inválidas";
      return res.status(401).render("login.html", { titulo: "Identificarse", errors, values: { username } });
    }
    const ok = await user.comparePassword(password);
    if (!ok) {
      errors.general = "Credenciales inválidas";
      return res.status(401).render("login.html", { titulo: "Identificarse", errors, values: { username } });
    }

    signAndSetCookie(res, { usuario: user.username, uid: String(user._id) });
    return res.redirect("/");
  } catch (e) {
    console.error(e);
    errors.general = "Error autenticando";
    return res.status(500).render("login.html", { titulo: "Identificarse", errors, values: { username } });
  }
});

// ---------- GET: Logout ----------
router.get("/logout", (req, res) => {
  res.clearCookie("access_token", { httpOnly: true, sameSite: "lax", secure: process.env.IN === "production" });
  return res.redirect("/");
});

export default router;
