import express from 'express';
import cors from 'cors';
import menuRoutes from './routes/menu.js';
// ... other imports ...

const app = express();

app.use(cors());
app.use(express.json());

// Add routes
app.use('/api/menu', menuRoutes);
// ... other routes ...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});