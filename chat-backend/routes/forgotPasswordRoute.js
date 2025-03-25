// forgotPasswordRoute.js (o dentro del archivo de rutas de usuario)
import express from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js'; // Ajusta la ruta según tu estructura de proyecto

const router = express.Router();

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  // Validación: se requiere un email
  if (!email) {
    return res.status(400).json({ message: 'El correo es requerido.' });
  }

  try {
    // Buscar al usuario por email
    const user = await User.findOne({ email });
    
    // Para evitar que se pueda detectar la existencia de un email, se responde de forma similar
    if (!user) {
      return res.status(200).json({ message: 'Si existe una cuenta con ese correo, se enviarán instrucciones para recuperar la contraseña.' });
    }
    
    // Generar token de reseteo (token en formato hexadecimal)
    const resetToken = crypto.randomBytes(20).toString('hex');
    // Hashear el token antes de almacenarlo
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Asignar el token y establecer una expiración (por ejemplo, 1 hora)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 3600000 ms = 1 hora
    await user.save();

    // Construir la URL para restablecer la contraseña
    // Asumiendo que tienes una variable de entorno FRONTEND_URL definida (p.ej. "http://localhost:3000")
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Configurar el mensaje del correo
    const message = `
      <p>Has solicitado recuperar tu contraseña.</p>
      <p>Por favor, haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>Si no solicitaste esta acción, ignora este correo.</p>
    `;

    // Configurar el transporte de email usando Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,           // p.ej.: 'smtp.gmail.com'
      port: process.env.EMAIL_PORT,           // p.ej.: 587
      secure: process.env.EMAIL_SECURE === 'true', // true para 465, false para otros puertos
      auth: {
        user: process.env.EMAIL_USER,         // tu usuario de email
        pass: process.env.EMAIL_PASS,         // tu contraseña de email
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,           // p.ej.: 'no-reply@tudominio.com'
      to: user.email,
      subject: 'Recuperar contraseña',
      html: message,
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);

    // Responder siempre con un mensaje genérico
    res.status(200).json({ message: 'Si existe una cuenta con ese correo, se enviarán instrucciones para recuperar la contraseña.' });
  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({ message: 'Error al procesar la solicitud.' });
  }
});

export default router;
