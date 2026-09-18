import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { HabitEngine } from './habit_engine.js';
import { RevenueCatManager } from './revenuecat_manager.js';
import { AdaptiveAICoach } from './ai_coach.js';
import { resolveSafePath, readJsonBody } from './util.js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load local project .env first, then fallback to master hackathons .env
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const sendJson = (res, status, payload) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
};

/**
 * Build a fully wired HabitFlow Pro HTTP server without binding a port.
 * Exposed so integration tests can drive it on an ephemeral port.
 *
 * @returns {{ server: import('http').Server, engine: HabitEngine, rc: RevenueCatManager, coach: AdaptiveAICoach }}
 */
export function createHabitFlowServer() {
  const engine = new HabitEngine();
  const rc = new RevenueCatManager();
  const coach = new AdaptiveAICoach(rc);

  // Optional webhook shared-secret. When set, RevenueCat webhook calls must send
  // `Authorization: Bearer <secret>` (configure the same value in the RC dashboard).
  const webhookSecret = process.env.REVENUECAT_WEBHOOK_AUTH || null;

  // Seed initial habits — capture the generated IDs (do NOT hard-code them).
  const seed1 = engine.addHabit({ title: 'Morning Deep Focus Block (90m)', category: 'focus' });
  const seed2 = engine.addHabit({ title: 'Daily Zone 2 Cardio & Mobility', category: 'health' });
  engine.recordCompletion(seed1.id);
  engine.recordCompletion(seed2.id);

  const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      // Health check endpoint for container probes & cloud orchestrators
      if (req.url === '/api/health' && req.method === 'GET') {
        return sendJson(res, 200, {
          status: 'online',
          service: 'HabitFlow Pro',
          timestamp: new Date().toISOString(),
          isPro: rc.isPro(),
          habitCount: engine.habits.size
        });
      }

      if (req.url === '/api/state' && req.method === 'GET') {
        const customerInfo = await rc.getCustomerInfo();
        const habits = engine.getAllHabits();
        return sendJson(res, 200, {
          isPro: rc.isPro(),
          customerInfo,
          habits,
          habitCount: habits.length,
          offerings: rc.getOfferings(),
          customerCenter: rc.getCustomerCenterData()
        });
      }

      if (req.url === '/api/habits' && req.method === 'POST') {
        const data = await readJsonBody(req);
        if (!data.title || typeof data.title !== 'string') {
          return sendJson(res, 400, { error: 'A non-empty habit "title" is required.' });
        }
        if (!rc.canCreateHabit(engine.habits.size)) {
          return sendJson(res, 403, {
            error: 'FREE_TIER_LIMIT_REACHED',
            message: 'Free tier permits up to 3 active habits. Upgrade to HabitFlow Pro for unlimited routines.',
            triggerPaywall: true
          });
        }
        const habit = engine.addHabit({ title: data.title, category: data.category || 'general' });
        return sendJson(res, 201, { habit, habits: engine.getAllHabits() });
      }

      if (req.url === '/api/habits/complete' && req.method === 'POST') {
        const { habitId } = await readJsonBody(req);
        if (!engine.habits.has(habitId)) {
          return sendJson(res, 404, { error: `Habit not found: ${habitId}` });
        }
        const result = engine.recordCompletion(habitId);
        return sendJson(res, 200, { result, habits: engine.getAllHabits() });
      }

      if (req.url === '/api/ai-coach' && req.method === 'GET') {
        return sendJson(res, 200, coach.generateInsights(engine));
      }

      if (req.url === '/api/purchase' && req.method === 'POST') {
        const { packageIdentifier } = await readJsonBody(req);
        const purchase = await rc.purchasePackage(packageIdentifier);
        return sendJson(res, 200, { success: true, purchase });
      }

      if (req.url === '/api/webhooks/revenuecat' && req.method === 'POST') {
        if (webhookSecret) {
          const auth = req.headers['authorization'] || '';
          if (auth !== `Bearer ${webhookSecret}`) {
            return sendJson(res, 401, { error: 'Unauthorized webhook request' });
          }
        }
        const event = await readJsonBody(req);
        const result = rc.handleWebhookEvent(event);
        return sendJson(res, 200, { status: 'ok', result });
      }

      // Static file serving (path-traversal safe)
      const filePath = resolveSafePath(PUBLIC_DIR, req.url);
      if (!filePath) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      fs.readFile(filePath, (err, content) => {
        if (err) {
          const code = err.code === 'ENOENT' ? 404 : 500;
          res.writeHead(code, { 'Content-Type': 'text/plain' });
          res.end(code === 404 ? '404 Not Found' : 'Server Error');
        } else {
          res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
          res.end(content);
        }
      });
    } catch (err) {
      // readJsonBody rejections carry a statusCode (400/413); everything else is 400.
      const status = err.statusCode || 400;
      sendJson(res, status, { error: err.message });
    }
  });

  return { server, engine, rc, coach };
}

// Only start listening when run directly (not when imported by tests).
const isMain = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isMain) {
  const PORT = process.env.PORT || 3001;
  const { server } = createHabitFlowServer();

  server.listen(PORT, () => {
    console.log(`🚀 HabitFlow Pro Server running at http://localhost:${PORT}`);
    console.log(`📋 Health: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Webhook auth: ${process.env.REVENUECAT_WEBHOOK_AUTH ? 'enabled' : 'disabled (set REVENUECAT_WEBHOOK_AUTH)'}`);
  });

  const shutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
