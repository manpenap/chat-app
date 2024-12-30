import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Generar token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Registro de usuario
export const registerUser = async (req, res) => {
  const { name, email, password, level } = req.body;

  // Asignar id_path basado en el nivel
  const idPaths = {
    Beginner: "a1_path",
    Basic: "a2_path",
    "Pre-Intermediate": "b1_path",
    "Upper-Intermediate": "b2_path",
    Advanced: "c1_path",
  };

  const id_path = idPaths[level];
  console.log(id_path);

  if (!id_path) {
    return res.status(400).json({ message: "Nivel inválido." });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "El usuario ya existe" });

    const user = await User.create({ name, email, password, level, id_path });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      level: user.level,
      id_path: user.id_path,
      token: generateToken(user._id),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al registrar usuario", error: error.message });
  }
};

// Login de usuario
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        level: user.level,
        id_path: user.id_path,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Credenciales inválidas" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al iniciar sesión", error: error.message });
  }
};

// Obtener perfil del usuario
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      level: user.level,
      id_path: user.id_path,
    });
  } else {
    res.status(404).json({ message: "Usuario no encontrado" });
  }
};
