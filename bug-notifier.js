const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, 'bug-state.json');
const NTFY_TOPIC = 'https://ntfy.sh/bug-forest-game-p69Fb';
const COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 hours

async function main() {
  let state;
  try {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    console.log('No bug-state.json found — nothing to check.');
    return;
  }

  const { myBase, myTs, lastNotified } = state;
  if (myBase == null || myTs == null) {
    console.log('State file missing myBase/myTs — skipping.');
    return;
  }

  // Same drain formula as index.html: drains fully in ~15 min (900s)
  const elapsed = (Date.now() - myTs) / 1000;
  const missYou = Math.max(0, myBase - (elapsed / 900) * 100);
  console.log(`Miss-you level: ${missYou.toFixed(1)}%`);

  if (missYou >= 50) {
    console.log('Bug is fine — no notification needed.');
    return;
  }

  // Anti-spam: skip if notified less than 2 hours ago
  if (lastNotified && (Date.now() - lastNotified) < COOLDOWN_MS) {
    const mins = ((COOLDOWN_MS - (Date.now() - lastNotified)) / 60000).toFixed(0);
    console.log(`Cooldown active — next notification in ~${mins} min.`);
    return;
  }

  // Send push notification
  const msg = missYou <= 10
    ? 'Bug really misses you... Mr. Cookie is getting worried!'
    : `Bug misses you! (${missYou.toFixed(0)}% miss-you meter)`;

  try {
    const res = await fetch(NTFY_TOPIC, {
      method: 'POST',
      headers: { 'Title': 'Bug misses you!', 'Tags': 'cat,sparkles' },
      body: msg,
    });
    if (res.ok) {
      console.log('Notification sent!');
      state.lastNotified = Date.now();
      fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    } else {
      console.error(`ntfy responded with ${res.status}`);
    }
  } catch (err) {
    console.error('Failed to send notification:', err.message);
  }
}

main();
