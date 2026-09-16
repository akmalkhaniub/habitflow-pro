# 🆓 Zero-Cost Cloud & Database Guide for HabitFlow Pro

Deploy **HabitFlow Pro** using **Koyeb Free Tier**, **Render Blueprints**, **Supabase Free Database**, and **Cloudflare Tunnels**.

---

## 1. Free Backend Hosting: Koyeb Free Eco
Koyeb provides 550 free compute hours per month with zero sleep time:
1. Connect your GitHub repository at [koyeb.com](https://www.koyeb.com).
2. Select **Docker deployment** (it will read `koyeb.yaml` or `Dockerfile`).
3. Set Port to `3001` and deploy.

---

## 2. Free Database: Supabase PostgreSQL
1. Create a free project at [supabase.com](https://supabase.com) (500MB DB).
2. Navigate to **SQL Editor** and paste `deploy/free/supabase_schema.sql`.
3. Copy your project connection string into `.env`:
   ```bash
   DATABASE_URL="postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```

---

## 3. RevenueCat Webhook Testing: Cloudflare Tunnel
To receive live RevenueCat purchase and cancellation webhook events locally:
```powershell
# Windows
.\deploy\free\tunnel.ps1 -Port 3001

# Linux / macOS
./deploy/free/tunnel.sh 3001
```
Copy the generated `https://*.trycloudflare.com` URL and paste it into:
**RevenueCat Dashboard > Project Settings > Webhooks > Add Endpoint**:
`https://your-tunnel-url.trycloudflare.com/api/webhooks/revenuecat`
