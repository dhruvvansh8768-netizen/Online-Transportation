# RideGo — Online Transportation Application (DBMS Lab Project)

**Team:** Dhruv Vansh & Rudra Patel (Adani University • ECSCI24201)

---

## 1. Run Locally (Development)

### Step 1 — Load PostgreSQL Database
Open pgAdmin or `psql` and execute:
```sql
-- Run: server/database/schema.sql
```
This creates all Lab-2 & Lab-3 tables (`CUSTOMER`, `LOCATION`, `PAYMENT`, `RIDESTATUS`, `VEHICLE`, `DRIVER`, `PROMOCODE`, `CUSTOMERFEEDBACK`, `BOOKING`) with all Ahmedabad seed records, plus the app authentication & real-time tables.

### Step 2 — Start Backend
```bash
cd server
copy .env.example .env   # Edit DB_PASSWORD / DATABASE_URL and JWT_SECRET
npm install
npm run dev
```
Backend runs at `http://localhost:5000` (health check: `http://localhost:5000/health`).

### Step 3 — Start Frontend
```bash
cd client
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## 2. Publish Online (100% Free Hosting)

### A. Database — Neon.tech (Free Serverless PostgreSQL)
1. Create a free project at **https://neon.tech**.
2. Open the **SQL Editor** in Neon and paste & run `server/database/schema.sql`.
3. Copy your `DATABASE_URL` connection string.

### B. Backend — Render.com
1. Push this repo to **GitHub**.
2. Go to **https://render.com** → **New +** → **Web Service** (or Blueprint using `render.yaml`).
3. Set Root Directory to `server`, Build Command `npm install`, Start Command `npm start`.
4. Add Environment Variables:
   - `DATABASE_URL` = your Neon PostgreSQL URL
   - `JWT_SECRET` = any strong random string
   - `CLIENT_URL` = your Vercel frontend URL (e.g. `https://ridego-dbms.vercel.app`)
   - `NODE_ENV` = `production`

### C. Frontend — Vercel.com
1. Go to **https://vercel.com** → **Add New Project** → Import your GitHub repo.
2. Set **Root Directory** to `client`.
3. Add Environment Variable:
   - `VITE_API_URL` = your Render backend URL (e.g. `https://ridego-backend.onrender.com`)
4. Click **Deploy**! `client/vercel.json` automatically handles React Router routes (`/story-demo`, `/rider`, `/driver`, `/admin`).

---

## 3. Presenting to Ma'am (Lab-2 & Lab-3 Story Mode)
- Open `/story-demo` (or click **Lab Story Mode** on the Landing page) to walk through **Rahul & Aman's Ahmedabad Airport Story** step-by-step alongside the exact PostgreSQL tables and SQL queries!
- Or click **Quick Demo Access** on `/login` for 1-click previews of **Rider (Rahul)**, **Driver (Ramesh)**, and **Admin DB**.

