// model/Usuario.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const usuarioSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 40
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: /.+@.+\..+/,
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
}, { timestamps: true });

usuarioSchema.index({ username: 1 }, { unique: true });

// Hash automático antes de guardar si cambió el password
usuarioSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (e) {
    next(e);
  }
});

// Método de instancia para validar password
usuarioSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model("Usuario", usuarioSchema);
