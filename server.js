const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data', 'questions.json');

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Initialize data file if it doesn't exist
async function initDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({ questions: [], revealed: [] }), 'utf8');
  }
}

// Read data from file
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return { questions: [], revealed: [] };
  }
}

// Write data to file
async function writeData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
}

// Initialize on startup
ensureDataDir().then(() => initDataFile());

// GET endpoint - retrieve all questions
app.get('/api/questions', async (req, res) => {
  try {
    const data = await readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve questions' });
  }
});

// POST endpoint - save questions
app.post('/api/questions', async (req, res) => {
  try {
    const { questions, revealed } = req.body;
    if (!Array.isArray(questions) || !Array.isArray(revealed)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    const success = await writeData({ questions, revealed });
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to save questions' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to save questions' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

