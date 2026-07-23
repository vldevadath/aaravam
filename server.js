require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { kv } = require('@vercel/kv');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve the static HTML/CSS/JS files
app.use(express.static(__dirname));

// Helper to read DB
const readDB = async () => {
  try {
    const data = await kv.get('aaravam_events_data');
    if (!data) {
      return { events: [] };
    }
    return data;
  } catch (err) {
    console.error('Error reading from KV', err);
    return { events: [] };
  }
};

// Helper to write DB
const writeDB = async (data) => {
  try {
    await kv.set('aaravam_events_data', data);
  } catch (err) {
    console.error('Error writing to KV', err);
  }
};

// --- API Endpoints ---

// Get all events
app.get('/api/events', async (req, res) => {
  const data = await readDB();
  res.json(data);
});

// Add a new event
app.post('/api/events', async (req, res) => {
  const { name, category } = req.body;
  if (!name || !category) {
    return res.status(400).json({ error: 'Missing name or category' });
  }

  const data = await readDB();
  const newEvent = {
    id: 'evt_' + Date.now() + Math.random().toString(36).substring(2, 7),
    name,
    category,
    points: {}
  };
  
  data.events.push(newEvent);
  await writeDB(data);
  
  res.status(201).json(newEvent);
});

// Update event points
app.put('/api/events/:id/points', async (req, res) => {
  const { id } = req.params;
  const points = req.body; // should be an object like { "batch_22": 10 }
  
  const data = await readDB();
  const eventIndex = data.events.findIndex(e => e.id === id);
  
  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  data.events[eventIndex].points = points;
  await writeDB(data);
  
  res.json(data.events[eventIndex]);
});

// Delete an event
app.delete('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  
  const data = await readDB();
  const initialLength = data.events.length;
  data.events = data.events.filter(e => e.id !== id);
  
  if (data.events.length === initialLength) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  await writeDB(data);
  res.json({ success: true });
});

// Export the Express app for Vercel Serverless
module.exports = app;

// Start server locally if not imported
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
