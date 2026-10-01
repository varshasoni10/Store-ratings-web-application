require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const routes = require('./routes');
const { ensureDefaultAdmin } = require('./utils/seed');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', routes);
app.use('/api', (req, res) => res.status(404).json({ message: 'Route not found' }));

// Serve the built React app when it exists (production); in development Vite serves it.
const clientDir = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(clientDir)) {
  app.use(express.static(clientDir));
  app.get('*', (req, res) => res.sendFile(path.join(clientDir, 'index.html')));
}

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ message: err.errors.map((e) => e.message).join(', ') });
  }
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

(async () => {
  await sequelize.authenticate();
  await sequelize.sync();
  await ensureDefaultAdmin();
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
})().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
