# 🚗 RideGo — Online Transportation Application (DBMS Project)

> Full-stack Uber / Rapido-style Ride-Hailing Platform built with **React**, **Tailwind CSS**, **Leaflet Maps**, **Node.js**, **Express**, **Socket.io**, and **PostgreSQL**.

**Course:** Database Management Systems (`ECSCI24201`) — Adani University  
**Team:** Dhruv Vansh & Rudra Patel

---

## ✨ Key Features

- **Interactive Lab-2 & Lab-3 Story Mode (`/story-demo`):** Step-by-step presentation walkthrough of Rahul & Aman's Ahmedabad Airport trip with live SQL query previews and Leaflet GPS route.
- **Rider App (`/rider`):** Live Ahmedabad map, structured pickup/drop search, vehicle selection (Bike, Auto, Hatchback, Sedan, SUV, EV), fare breakdown, promo codes (`WELCOME10`, `FIRST50`, `RIDE100`), payment modes (UPI, Credit/Debit Card, Net Banking, Wallet, Cash), live GPS tracking, and 1–5 star customer feedback.
- **Driver App (`/driver`):** Online/Offline duty toggle, incoming ride request timer, pickup navigation, Ride OTP verification, live trip navigation, and Recharts earnings dashboard.
- **Admin Dashboard (`/admin`):** KPI cards, revenue area charts, user/ride/vehicle/payment/promo management, and locality demand analytics.
- **1-Click Demo Access (`/login`):** Instant preview for Rider, Driver, and Admin roles.

---

## 🗄️ Database Schema (PostgreSQL)

All Lab-2 & Lab-3 normalized tables + seed data are located in [`server/database/schema.sql`](server/database/schema.sql):
- `CUSTOMER`, `LOCATION`, `PAYMENT`, `RIDESTATUS`, `VEHICLE`, `DRIVER`, `PROMOCODE`, `CUSTOMERFEEDBACK`, `BOOKING`
- Extended full-stack auth & real-time tables: `users`, `drivers`, `vehicles`, `rides`, `payments`, `ratings`, `promo_codes`, `saved_addresses`, `notifications`

See [`QUERY_GUIDE.md`](QUERY_GUIDE.md) for all `INSERT`, `UPDATE`, and `SELECT JOIN` queries mapped to each GUI screen.

---

## 🚀 Quick Start

### 1. Database Setup
Run [`server/database/schema.sql`](server/database/schema.sql) in pgAdmin or `psql`.

### 2. Backend (`server/`)
```bash
cd server
cp .env.example .env   # Configure DB_PASSWORD / DATABASE_URL and JWT_SECRET
npm install
npm run dev
```

### 3. Frontend (`client/`)
```bash
cd client
npm install
npm run dev
```

### 4. Publish Online
Follow [`DEPLOYMENT.md`](DEPLOYMENT.md) to deploy PostgreSQL on **Neon**, backend on **Render**, and frontend on **Vercel**.

