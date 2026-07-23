require('dotenv').config();
const { kv } = require('@vercel/kv');

const OFF_STAGE_EVENTS = [
  "Painting", "Essay Writing (Hin)", "Poetry Writing (Hin)", "Collage",
  "Short Story (Eng)", "Short Story (Hin)", "Essay Writing (Eng)",
  "Fabric Painting", "Poster Making", "Mehandi", "Poetry Writing (Eng)",
  "Short Story (Mal)", "Face Painting", "Pencil Drawing", "Cartoon",
  "Clay Modelling", "Poetry Writing (Mal)", "Essay Writing (Mal)",
  "Rangoli", "Vegetable Carving", "Flower Arrangement"
];

const ON_STAGE_EVENTS = [
  "Light Music (Female)", "Light Music (Male)", "Kadhaprasangam",
  "Instrumental (Percussion)", "Instrumental (String)", "Instrumental (Wind)",
  "Mono Act", "Kuchipudi", "Western Solo", "Bharatanatyam", "Western Group",
  "Mimicry", "Quiz", "Group Dance", "Elocution (Mal)", "Extempore (Mal)",
  "Recitation (Mal)", "Elocution (Eng)", "Extempore (Eng)", "Recitation (Eng)",
  "Mohiniyattam", "Mock Press", "Folk Dance", "Thiruvathirakali", "Nadanpattu",
  "Adaptune (Male)", "Adaptune (Female)", "Recitation (Arabic)",
  "Recitation (Sanskrit)", "Elocution (Hindi)", "Extempore (Hindi)",
  "Recitation (Hindi)", "Group Song", "Mime", "Patriotic Song", "Skit",
  "Ad-Zap", "Drama", "Classical Music (Female)", "Classical Music (Male)",
  "Mappilapattu (Female)", "Mappilapattu (Male)", "Oppana", "Vattappattu",
  "Synchro", "Ganamela"
];

async function seed() {
  console.log("Fetching current DB...");
  let currentData = { events: [] };
  
  try {
    const data = await kv.get('aaravam_events_data');
    if (data && data.events) {
      currentData = data;
    }
  } catch (err) {
    console.log("No existing data or error fetching, starting fresh.");
  }

  // To prevent duplicates, we'll track existing names
  const existingNames = new Set(currentData.events.map(e => e.name.toLowerCase()));
  
  let addedCount = 0;

  const createEvent = (name, category) => {
    if (!existingNames.has(name.toLowerCase())) {
      currentData.events.push({
        id: 'evt_' + Date.now() + Math.random().toString(36).substring(2, 7),
        name,
        category,
        points: {}
      });
      existingNames.add(name.toLowerCase());
      addedCount++;
    }
  };

  OFF_STAGE_EVENTS.forEach(name => createEvent(name.toUpperCase(), 'off_stage'));
  ON_STAGE_EVENTS.forEach(name => createEvent(name.toUpperCase(), 'on_stage'));

  console.log(`Added ${addedCount} new events.`);
  
  if (addedCount > 0) {
    console.log("Saving to KV database...");
    await kv.set('aaravam_events_data', currentData);
    console.log("Database seeded successfully!");
  } else {
    console.log("No new events to add.");
  }
}

seed().catch(console.error);
