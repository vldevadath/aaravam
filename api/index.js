const express = require('express');
const cors = require('cors');
const { kv } = require('@vercel/kv');

const app = express();

app.use(cors());
app.use(express.json());

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

// --- Authentication Middleware ---
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== 'Bearer aaravam@admin2526') {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing password' });
  }
  next();
};

// --- API Endpoints ---

// Get all events
app.get('/api/events', async (req, res) => {
  const data = await readDB();
  res.json(data);
});

// Add a new event
app.post('/api/events', requireAuth, async (req, res) => {
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

// Update event name
app.put('/api/events/:id/name', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const data = await readDB();
  const eventIndex = data.events.findIndex(e => e.id === id);
  
  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  data.events[eventIndex].name = name;
  await writeDB(data);
  
  res.json(data.events[eventIndex]);
});

// Update event points and winners
app.put('/api/events/:id/points', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { points, winners } = req.body; 
  
  const data = await readDB();
  const eventIndex = data.events.findIndex(e => e.id === id);
  
  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  if (points) {
    data.events[eventIndex].points = points;
  }
  
  // Update winners array (could be empty if admin clears it)
  data.events[eventIndex].winners = winners || [];
  
  await writeDB(data);
  
  res.json(data.events[eventIndex]);
});

// Delete an event
app.delete('/api/events/:id', requireAuth, async (req, res) => {
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

module.exports = app;
