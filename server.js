const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const STATE_FILE = path.join(__dirname, 'bug-state.json');
const NOTES_FILE = path.join(__dirname, 'notes.json');

app.use(express.json());
app.use(express.static(__dirname));

// ── State API ──────────────────────────────────

app.get('/api/state', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    res.json(data);
  } catch {
    res.json({ myBase: 100, myTs: Date.now() });
  }
});

app.post('/api/state', (req, res) => {
  const { myBase, myTs } = req.body;
  if (myBase == null || myTs == null) {
    return res.status(400).json({ error: 'myBase and myTs required' });
  }
  let existing = {};
  try { existing = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch {}
  existing.myBase = myBase;
  existing.myTs = myTs;
  fs.writeFileSync(STATE_FILE, JSON.stringify(existing, null, 2));
  res.json({ ok: true });
});

// ── Notes API ──────────────────────────────────

app.get('/api/notes', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(NOTES_FILE, 'utf8'));
    res.json(data);
  } catch {
    res.json({ note: '' });
  }
});

app.post('/api/notes', (req, res) => {
  const { note } = req.body;
  if (note == null) {
    return res.status(400).json({ error: 'note required' });
  }
  fs.writeFileSync(NOTES_FILE, JSON.stringify({ note }, null, 2));
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Bug's server running at http://localhost:${PORT}`);
});
