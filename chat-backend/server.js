import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';
const allowedOrigins = ['http://localhost:3000', 'https://chat-app-gamma-mauve.vercel.app']; 
// Importar todas las rutas desde el archivo index.js
import routes from './routes/index.js';

const app = express();

// Middleware global
app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Conexión a la base de datos MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conexión exitosa a MongoDB Atlas'))
  .catch((error) => console.error('Error conectando a MongoDB Atlas:', error));

// Registrar rutas principales (modularizadas)
app.use('/api', routes);

// Middleware para manejo global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente 🚀");
});


// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

