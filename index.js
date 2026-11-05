require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('node:path');
const pool = require('./config/db.config');
const employeeRoutes = require('./src/routes/employee.routes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (_error) {
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

app.use('/api/employees', employeeRoutes);

app.get('/api/films', async (_req, res, next) => {
  try {
    const response = await fetch('https://ghibliapi.vercel.app/films', {
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      res.status(502).json({ error: 'The films service returned an error.' });
      return;
    }
    res.json({ data: await response.json() });
  } catch (error) {
    next(error);
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

app.use((error, _req, res, _next) => {
  if (error.code === 'ER_DUP_ENTRY') {
    res.status(409).json({ error: 'An employee with that email already exists.' });
    return;
  }
  if (error.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'Request body contains invalid JSON.' });
    return;
  }

  console.error(error);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => {
    console.log(`Employee API listening at http://localhost:${port}`);
  });
}

module.exports = app;
