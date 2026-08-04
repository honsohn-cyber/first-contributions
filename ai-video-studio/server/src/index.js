import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { router as videosRouter } from './routes/videos.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/api/videos', videosRouter);
app.use('/media', express.static(config.storageDir, { maxAge: '1h' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(config.port, () => {
  console.log(`AI Video Studio server listening on http://localhost:${config.port}`);
});
