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

## 🗄️ Database Schema (Strict 9 Normalized Tables)

The database `ridehailing_db` contains **strictly the 9 normalized DBMS Lab-2 & Lab-3 relational tables**:

| # | Table Name | Key Attributes | Cardinality Role |
|---|---|---|---|
| 1 | **`CUSTOMER`** | `CustomerID` (PK), `FirstName`, `MiddleName`, `LastName` | 1:M to BOOKING |
| 2 | **`LOCATION`** | `LocationID` (PK), `HouseNo_Building`, `Street_Road`, `Locality`, `City`, `Pincode` | 1:M to BOOKING (Pickup & Drop) |
| 3 | **`DRIVER`** | `DriverID` (PK), `DriverName`, `DriverRating`, `DriverContactNo`, `YearOfExperience` | 1:M to BOOKING |
| 4 | **`VEHICLE`** | `VehicleID` (PK), `VehicleModel`, `VehicleType`, `Vehiclecolor`, `Vehiclecode`, `LincensePlateNo` | 1:M to BOOKING |
| 5 | **`BOOKING`** | `BookingID` (PK), `BookingDate`, `BookingTime`, `Fares`, 8 Foreign Keys | **Central Fact Table** |
| 6 | **`PAYMENT`** | `PaymentID` (PK), `PaymentMode` (UPI, Card, Cash, Wallet) | 1:M to BOOKING |
| 7 | **`PROMOCODE`** | `PromoCodeID` (PK), `Code`, `Discount`, `ExpiryDate` | 1:M to BOOKING |
| 8 | **`RIDESTATUS`** | `RideStatusID` (PK), `Status` (Booked, Arrived, In Progress, Completed, Cancelled) | 1:M to BOOKING |
| 9 | **`CUSTOMERFEEDBACK`** | `FeedbackID` (PK), `Rating` (1-5), `Review`, `FeedbackDate` | 1:1 to BOOKING |

---

## 📝 How to Insert Data into the System

### A. Direct from Frontend GUI

1. **Interactive DBMS Walkthrough (`/story-demo`):**
   - Click **"DBMS walkthrough"** in the top navigation bar (`http://localhost:5173/story-demo`).
   - Steps through the 5-stage lifecycle and executes live SQL INSERTs into `CUSTOMER`, `LOCATION`, `BOOKING`, `DRIVER`, and `CUSTOMERFEEDBACK`.
   - Displays real-time query text, execution duration (ms), and affected rows directly on the screen.

2. **Rider Booking Flow (`/rider`):**
   - Select Pickup locality and Drop-off destination on the live Leaflet map.
   - Choose vehicle tier (`Sedan`, `SUV`, `Hatchback`).
   - Select payment mode and apply promo code.
   - Click **"Confirm Booking"** — automatically generates and inserts a new row into `BOOKING`.

3. **Admin Management Workspace (`/admin`):**
   - Navigate to **Promotions** (`/admin/promos`) and click **"+ Add Promo"** to insert into `PROMOCODE`.
   - Navigate to **Users** (`/admin/users`) and click **"+ Add User"** to insert into `CUSTOMER` / `DRIVER`.

---

### B. Direct from PostgreSQL / pgAdmin

Open **Query Tool** in pgAdmin on `ridehailing_db` and run any of these queries:

#### 1. Insert New Customer
```sql
INSERT INTO CUSTOMER (FirstName, MiddleName, LastName)
VALUES ('Rahul', 'Kumar', 'Patel')
RETURNING *;
```

#### 2. Insert Pickup & Drop Locations
```sql
INSERT INTO LOCATION (HouseNo_Building, Street_Road, Locality, City, State, Pincode)
VALUES ('25', 'MG Road', 'Navrangpura', 'Ahmedabad', 'Gujarat', '380009'),
       ('10', 'Airport Road', 'Hansol', 'Ahmedabad', 'Gujarat', '382475')
RETURNING *;
```

#### 3. Insert Driver & Vehicle
```sql
INSERT INTO DRIVER (DriverName, DriverRating, DriverContactNo, YearOfExperience)
VALUES ('Ramesh Patel', 4.85, '9876543210', 8)
RETURNING *;

INSERT INTO VEHICLE (VehicleModel, VehicleType, Vehiclecolor, Vehiclecode, LincensePlateNo)
VALUES ('Swift Dzire', 'Sedan', 'White', 'VH012', 'GJ01AB9999')
RETURNING *;
```

#### 4. Insert Promo Code
```sql
INSERT INTO PROMOCODE (Code, Discount, ExpiryDate)
VALUES ('FESTIVE50', 50.00, '2026-12-31')
RETURNING *;
```

#### 5. Insert Complete Booking (Linking All 9 Tables)
```sql
INSERT INTO BOOKING (
    BookingDate, BookingTime, RideType, NoOfPassengers, ContactNumber,
    EstimatedDistance, EstimatedFare, FinalFare,
    CustomerID, Pickup_LocationID, Drop_LocationID, PaymentID,
    VehicleID, DriverID, PromoCodeID, RideStatusID, FeedbackID
) VALUES (
    CURRENT_DATE, CURRENT_TIME, 'Sedan', 2, '9876543210',
    9.40, 215.00, 165.00,
    1, 1, 2, 1,
    1, 1, 1, 5, 1
) RETURNING *;
```

---

## 🔄 Live Bidirectional Sync

- **Insert in Database ➡️ Reflected in Frontend:** When you run `INSERT` in pgAdmin, the frontend will display the updated records upon refreshing the respective screen.
- **Insert in Frontend ➡️ Stored in Database:** Actions taken in the UI immediately persist into `ridehailing_db`. You can verify by running `SELECT * FROM BOOKING ORDER BY BookingID DESC LIMIT 5;` in pgAdmin.

---

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

