import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Función para generar token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Endpoint para restablecer la contraseña
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  // Hashear el token recibido para compararlo con el almacenado
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "El token es inválido o ha expirado." });
    }

    // Actualizar la contraseña y limpiar campos de reseteo
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // El middleware pre-save se encargará de hashear la nueva contraseña
    await user.save();

    res.json({ message: "La contraseña se ha restablecido correctamente." });
  } catch (error) {
    res.status(500).json({ message: "Error al restablecer la contraseña.", error: error.message });
  }
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
  

  if (!id_path) {
    return res.status(400).json({ message: "Nivel inválido." });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "El email ya está registrado." });

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

// Endpoint para recuperar contraseña
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Validación básica
  if (!email) {
    return res.status(400).json({ message: "El correo es requerido." });
  }

  try {
    const user = await User.findOne({ email });

    // Responder de forma genérica para evitar la enumeración de usuarios
    if (!user) {
      return res.status(200).json({
        message:
          "Si existe una cuenta con ese correo, se enviarán instrucciones para recuperar la contraseña.",
      });
    }

    // Generar token de reseteo
    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Asignar token y expiración (1 hora)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 3600000;
    await user.save();

    // Construir URL para restablecer la contraseña
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `
      <p>Has solicitado recuperar tu contraseña.</p>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>Si no solicitaste este cambio, ignora este mensaje.</p>
    `;

    // Configuración de Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Recuperar contraseña",
      html: message,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message:
        "Si existe una cuenta con ese correo, se enviarán instrucciones para recuperar la contraseña.",
    });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    res
      .status(500)
      .json({ message: "Error al procesar la solicitud.", error: error.message });
  }
};
