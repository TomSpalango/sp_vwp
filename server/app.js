import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import './db/mysql.js';

dotenv.config();
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true, service: 'sp_vwp-api', time: new Date().toISOString() });
});

app.use('/api', routes);

const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
