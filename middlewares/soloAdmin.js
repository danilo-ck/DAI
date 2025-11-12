// middlewares/soloAdmin.js
export default function soloAdmin(req, res, next) {
  if (!req.user || !req.user.admin) {
    return res.status(403).render("403.html", { 
      titulo: "Acceso denegado",
      mensaje: "Solo los administradores pueden acceder a esta sección."
    });
  }
  next();
}
