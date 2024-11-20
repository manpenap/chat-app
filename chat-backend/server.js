import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';

// Importar todas las rutas desde el archivo index.js
import routes from './routes/index.js';

const app = express();

// Middleware global
app.use(cors());
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

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

