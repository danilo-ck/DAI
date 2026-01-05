// tienda.js
import express  from "express";
import nunjucks from "nunjucks";
import connectDB from "./model/db.js";
import TiendaRouter from "./routes/router_tienda.js";
import session from "express-session";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import morgan from "morgan";
import logger from "./utils/logger.js";
import ApiRouter from "./routes/router_api.js";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import cors from "cors";

await connectDB();

const app = express();
const IN = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 8000;

// Configuración Swagger/OpenAPI
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: { title: "Tienda API", version: "1.0.0" }
  },
  apis: ["./routes/router_api.js"]  // leerá los JSDoc de ese archivo
});

// CORS para desarrollo con React
if (IN === "development") {
  app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
  }));
}

// 1) Body parser para JSON
app.use(express.json());

// 2) Logger HTTP con morgan -> winston
app.use(morgan("dev", {
  stream: { write: msg => logger.http(msg.trim()) }
}));

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

// Middleware 404 para páginas web (antes de API)
app.use((req, res, next) => {
  res.status(404).render("404.html", { 
    titulo: "404 - Página no encontrada",
    mensaje: `No encontramos la página: ${req.url}`
  });
});

// 3) Documentación API con Swagger
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 4) API REST
app.use("/api", ApiRouter);

// 5) 404 para API (solo cuando empieza por /api)
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Recurso no encontrado" });
});

// 6) Middleware de errores (último)
app.use((err, req, res, next) => {
  logger.error(err.stack || err.message || String(err));
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Error interno" });
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});