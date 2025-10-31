// tienda.js
import express  from "express";
import nunjucks from "nunjucks";
import connectDB from "./model/db.js";
import TiendaRouter from "./routes/router_tienda.js";
import session from "express-session";

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

// Tests
app.get("/hola", (req, res) => res.send("Hola desde el servidor"));
app.get("/test", (req, res) => res.render("test.html"));

// Router de la tienda
app.use("/", TiendaRouter);

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
