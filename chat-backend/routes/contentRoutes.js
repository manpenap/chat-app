import express from 'express';
const router = express.Router();

// Define tus rutas aquí
router.get('/some-endpoint', (req, res) => {
  res.send('Hello from contentRoutes!');
});

// Exporta `router` como default
export default router;