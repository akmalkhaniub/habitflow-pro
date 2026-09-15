import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { HabitEngine } from './habit_engine.js';
import { RevenueCatManager } from './revenuecat_manager.js';
import { AdaptiveAICoach } from './ai_coach.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, 'public');
const PORT = process.env.PORT || 3001;

const engine = new HabitEngine();
const rc = new RevenueCatManager();
const coach = new AdaptiveAICoach(rc);

// Seed initial habits
engine.addHabit({ title: 'Morning Deep Focus Block (90m)', category: 'focus' });
engine.addHabit({ title: 'Daily Zone 2 Cardio & Mobility', category: 'health' });
engine.recordCompletion('h_1');
engine.recordCompletion('h_2');

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Routes
  if (req.url === '/api/state' && req.method === 'GET') {
    const customerInfo = await rc.getCustomerInfo();
    const habits = engine.getAllHabits();
    const offerings = rc.getOfferings();
    const customerCenter = rc.getCustomerCenterData();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      isPro: rc.isPro(),
      customerInfo,
      habits,
      habitCount: habits.length,
      offerings,
      customerCenter
    }));
    return;
  }

  if (req.url === '/api/habits' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (!rc.canCreateHabit(engine.habits.size)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'FREE_TIER_LIMIT_REACHED',
            message: 'Free tier permits up to 3 active habits. Upgrade to HabitFlow Pro for unlimited routines.',
            triggerPaywall: true
          }));
          return;
        }

        const habit = engine.addHabit({ title: data.title, category: data.category || 'general' });
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ habit, habits: engine.getAllHabits() }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (req.url === '/api/habits/complete' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { habitId } = JSON.parse(body);
        const result = engine.recordCompletion(habitId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ result, habits: engine.getAllHabits() }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (req.url === '/api/ai-coach' && req.method === 'GET') {
    const result = coach.generateInsights(engine);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  if (req.url === '/api/purchase' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { packageIdentifier } = JSON.parse(body);
        const purchase = await rc.purchasePackage(packageIdentifier);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, purchase }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (req.url === '/api/webhooks/revenuecat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const event = JSON.parse(body);
        const result = rc.handleWebhookEvent(event);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', result }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Static file serving
  let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8'
  };

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error: ' + err.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 HabitFlow Pro Server running at http://localhost:${PORT}`);
});
