// tienda.js
import express  from "express";
import nunjucks from "nunjucks";
import connectDB from "./model/db.js";
import TiendaRouter from "./routes/router_tienda.js";
import session from "express-session";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

await connectDB();

const app = express();
const IN = process.env.IN || "development";
const PORT = process.env.PORT_APP || 8000;

app.use(session({
  secret: process.env.SESSION_SECRET || 'my-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,              // ponlo true detrás de proxy HTTPS
    maxAge: 1000 * 60 * 60 * 6  // 6 horas
  }
}));

// Carrito en locals para todas las vistas
app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = { items: [], totalQty: 0, totalAmount: 0 };
  }
  res.locals.cart = req.session.cart;      // disponible en Nunjucks
  next();
});

// Nunjucks
nunjucks.configure("views", {
  autoescape: true,
  noCache: IN === "development",
  watch: IN === "development",
  express: app
});
app.set("view engine", "html");

// Static
app.use("/static", express.static("public"));

// Middleware para variables globales en todas las vistas
app.use((req, res, next) => {
  res.locals.currentYear = new Date().getFullYear();
  next();
});

// Cookie parser (debe ir ANTES de los routers)
app.use(cookieParser());

// JWT -> req.user y {{ usuario }} en plantillas
const autenticacion = (req, res, next) => {
  const token = req.cookies?.access_token;
  let usuario, esAdmin = false;
  if (token) {
    try {
      const data = jwt.verify(token, process.env.SECRET_KEY);
      req.user = { username: data.usuario, uid: data.uid, admin: !!data.admin };
      usuario = data.usuario;
      esAdmin = !!data.admin;
    } catch {
      req.user = undefined;
    }
  }
  // disponibles en Nunjucks
  app.locals.usuario = usuario;
  app.locals.esAdmin = esAdmin;
  next();
};
app.use(autenticacion);

// Monta el router de usuarios
import UsuariosRouter from "./routes/router_usuarios.js";
app.use("/usuarios", UsuariosRouter);

// Monta el router de administración
import AdminRouter from "./routes/router_admin.js";
app.use("/admin", AdminRouter);

// Tests
app.get("/hola", (req, res) => res.send("Hola desde el servidor"));
app.get("/test", (req, res) => res.render("test.html"));

// Router de la tienda (debe ir DESPUÉS de autenticación)
app.use("/", TiendaRouter);

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});