import express from 'express';
const router = express.Router();

// Define tus rutas aquí
router.get('/progress-endpoint', (req, res) => {
  res.send('Hello from progressRoutes!');
});

export default router;

