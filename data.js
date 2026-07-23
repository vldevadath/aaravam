// data.js
// Handles API state for Aaravam events and scores

const TEAMS = [
  { id: 'pg_phd', name: 'pg/phd' },
  { id: 'batch_22', name: '22 batch' },
  { id: 'batch_23', name: '23 batch' },
  { id: 'batch_24', name: '24 batch' },
  { id: 'batch_25', name: '25 batch' }
];

async function getData() {
  try {
    const response = await fetch('/api/events');
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Failed to fetch data", err);
    return { events: [] };
  }
}

async function addEvent(name, category) {
  try {
    const token = sessionStorage.getItem('adminToken') || '';
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, category })
    });
    return await response.json();
  } catch (err) {
    console.error("Failed to add event", err);
  }
}

async function updateEventName(eventId, name) {
  try {
    const token = sessionStorage.getItem('adminToken') || '';
    const response = await fetch(`/api/events/${eventId}/name`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    });
    return await response.json();
  } catch (err) {
    console.error("Failed to update event name", err);
  }
}

async function updateEventPoints(eventId, payload) {
  try {
    const token = sessionStorage.getItem('adminToken') || '';
    const response = await fetch(`/api/events/${eventId}/points`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    return await response.json();
  } catch (err) {
    console.error("Failed to update points/winners", err);
  }
}

async function deleteEvent(eventId) {
  try {
    const token = sessionStorage.getItem('adminToken') || '';
    await fetch(`/api/events/${eventId}`, { 
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } catch (err) {
    console.error("Failed to delete event", err);
  }
}

// Helper to get total score for all teams
async function getLeaderboard() {
  const data = await getData();
  const totals = {};
  
  // Initialize
  TEAMS.forEach(t => totals[t.id] = 0);

  // Sum points
  data.events.forEach(ev => {
    if (ev.points) {
      Object.keys(ev.points).forEach(teamId => {
        if (totals[teamId] !== undefined) {
          totals[teamId] += (Number(ev.points[teamId]) || 0);
        }
      });
    }
  });

  // Convert to array and sort descending
  const leaderboard = TEAMS.map(t => ({
    id: t.id,
    name: t.name,
    points: totals[t.id]
  }));

  leaderboard.sort((a, b) => b.points - a.points);
  return leaderboard;
}

// Make functions globally available
window.AaravamData = {
  TEAMS,
  getData,
  addEvent,
  updateEventName,
  updateEventPoints,
  deleteEvent,
  getLeaderboard
};
