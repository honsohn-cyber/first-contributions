import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { router as videosRouter } from './routes/videos.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/api/videos', videosRouter);
app.use('/media', express.static(config.storageDir, { maxAge: '1h' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// If the client has been built (see client/package.json "build" and the
// Dockerfile), serve it from this same process so the whole app runs as a
// single deployable service on one port/URL — e.g. on Render or any other
// host that just runs `npm start` in this folder.
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, { index: false }));
  app.get(/^(?!\/api|\/media).*/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
  console.log('Serving built client from', clientDist);
} else {
  console.log('No client build found — run `npm run build` in client/ to serve the frontend from this server.');
}

app.listen(config.port, () => {
  console.log(`AI Video Studio server listening on http://localhost:${config.port}`);
});
