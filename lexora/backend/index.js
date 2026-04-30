import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import tachesRouter from './routes/taches.js';
import facturesRouter from './routes/factures.js';
import planningRouter from './routes/planning.js';
import assistantRouter from './routes/assistant.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/taches', tachesRouter);
app.use('/api/factures', facturesRouter);
app.use('/api/planning', planningRouter);
app.use('/api/assistant', assistantRouter);

app.listen(PORT, () => {
  console.log(`Lexora backend running on port ${PORT}`);
});
