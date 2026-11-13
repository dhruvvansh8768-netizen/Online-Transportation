# PostgreSQL Query Guide — Connecting GUI Actions to SQL Queries

**Project:** RideGo — Online Transportation System (`ECSCI24201`)  
**Team:** Dhruv Vansh & Rudra Patel (Adani University)  
**Database:** PostgreSQL (`server/database/schema.sql`)

This guide explains **exactly which SQL query runs (or how to insert/edit data manually in pgAdmin / `psql`)** for every action in our GUI — mapped directly to **Lab-2 Story** and **Lab-3 Tables**.

---

## 1. Table Overview (Lab-2 & Lab-3 Schema)

| Table | Primary Key | GUI Screen Where Used |
|---|---|---|
| `CUSTOMER` | `CustomerID` | Sign Up, Rider Profile, Admin Users |
| `LOCATION` | `LocationID` | Search Destination, Rider Home, Saved Places |
| `PAYMENT` | `PaymentID` | Confirm Booking, Payment Screen, Admin Payments |
| `RIDESTATUS` | `RideStatusID` | Finding Driver, Driver Assigned, Live Tracking, Completed / Cancelled |
| `VEHICLE` | `VehicleID` | Driver Signup, Driver Profile, Admin Vehicle Fleet |
| `DRIVER` | `DriverID` | Driver Assigned, Live Tracking, Driver Profile |
| `PROMOCODE` | `PromoCodeID` | Confirm Booking (Apply Promo), Admin Promos |
| `CUSTOMERFEEDBACK` | `FeedbackID` | Ride Completed (1–5 Star Rating & Review) |
| `BOOKING` | `BookingID` | Confirm Booking, Ride History, Driver Incoming Request, Admin Rides |

---

## 2. How to INSERT Queries (Matching Every GUI Flow)

### Step 1 — Insert Customer (`Signup` / `Rider Profile`)
```sql
INSERT INTO CUSTOMER (FirstName, MiddleName, LastName)
VALUES ('Rahul', 'Kumar', 'Patel')
RETURNING *;
```

### Step 2 — Insert Pickup & Drop Locations (`SearchDestination.jsx`)
```sql
-- Pickup Location (Navrangpura)
INSERT INTO LOCATION (HouseNo_Building, Street_Road, Locality, City, State, Pincode, Country)
VALUES ('25', 'MG Road', 'Navrangpura', 'Ahmedabad', 'Gujarat', '380009', 'India')
RETURNING LocationID;

-- Drop Location (Airport Road, Hansol)
INSERT INTO LOCATION (HouseNo_Building, Street_Road, Locality, City, State, Pincode, Country)
VALUES ('10', 'Airport Road', 'Hansol', 'Ahmedabad', 'Gujarat', '382475', 'India')
RETURNING LocationID;
```

### Step 3 — Insert / Select Payment Mode (`ConfirmBooking.jsx` / `PaymentScreen.jsx`)
```sql
-- View all payment options shown in GUI
SELECT * FROM PAYMENT;

-- Add a new payment mode if needed
INSERT INTO PAYMENT (PaymentMode)
VALUES ('UPI');
```

### Step 4 — Insert Driver & Vehicle (`SignupDriver.jsx` / `DriverProfile.jsx`)
```sql
INSERT INTO DRIVER (DriverName, DriverRating, DriverContactNo, YearOfExperience)
VALUES ('Ramesh Patel', 4.80, '9876543210', 8)
RETURNING DriverID;

INSERT INTO VEHICLE (VehicleModel, VehicleType, Vehiclecolor, Vehiclecode, LincensePlateNo)
VALUES ('Swift Dzire', 'Sedan', 'White', 'VH001', 'GJ01AB1234')
RETURNING VehicleID;
```

### Step 5 — Insert Promo Code (`Admin` → `PromoManagement.jsx`)
```sql
INSERT INTO PROMOCODE (Code, Discount, ExpiryDate)
VALUES ('FIRST50', 50.00, '2026-09-30')
RETURNING *;
```

### Step 6 — Insert a New Booking (`ConfirmBooking.jsx`)
```sql
INSERT INTO BOOKING (
    BookingDate, BookingTime, RideType, NoOfPassengers, ContactNumber,
    EstimatedDistance, EstimatedFare, FinalFare,
    CustomerID, Pickup_LocationID, Drop_LocationID, PaymentID,
    VehicleID, DriverID, PromoCodeID, RideStatusID, FeedbackID
)
VALUES (
    CURRENT_DATE, CURRENT_TIME, 'Sedan', 2, '9876500005',
    9.40, 215.00, 165.00,
    5, 11, 12, 2,
    1, 1, 3, 1, NULL
)
RETURNING *;
```
> **Note:** In the GUI, `RideStatusID = 1` means `Booked` (`Requested`).

### Step 7 — Insert Customer Feedback (`RideCompleted.jsx`)
```sql
INSERT INTO CUSTOMERFEEDBACK (Rating, Review, FeedbackDate)
VALUES (5, 'Excellent ride and friendly driver', CURRENT_DATE)
RETURNING FeedbackID;

-- Link FeedbackID back to the Booking
UPDATE BOOKING
SET FeedbackID = 11
WHERE BookingID = 25;
```

---

## 3. How to EDIT / UPDATE Queries (Live Status & Profile Changes)

### A. Edit Ride Status Lifecycle (`FindingDriver` → `DriverAssigned` → `LiveTracking` → `RideCompleted`)
```sql
-- 1. Driver Accepts Ride (Booked -> Driver Assigned)
UPDATE BOOKING
SET RideStatusID = (SELECT RideStatusID FROM RIDESTATUS WHERE Status = 'Driver Assigned' LIMIT 1),
    DriverID = 1,
    VehicleID = 1
WHERE BookingID = 25;

-- 2. Driver Reaches Pickup (Driver Assigned -> Driver Arrived)
UPDATE BOOKING
SET RideStatusID = (SELECT RideStatusID FROM RIDESTATUS WHERE Status = 'Driver Arrived' LIMIT 1)
WHERE BookingID = 25;

-- 3. OTP Verified & Trip Starts (In Progress)
UPDATE BOOKING
SET RideStatusID = (SELECT RideStatusID FROM RIDESTATUS WHERE Status = 'In Progress' LIMIT 1)
WHERE BookingID = 25;

-- 4. Trip Ends & Actual Fare Calculated (Ride Completed)
UPDATE BOOKING
SET RideStatusID = (SELECT RideStatusID FROM RIDESTATUS WHERE Status = 'Ride Completed' LIMIT 1),
    FinalFare = 185.00
WHERE BookingID = 25;

-- 5. Aman Cancels Ride Before Driver Arrives (Cancelled)
UPDATE BOOKING
SET RideStatusID = (SELECT RideStatusID FROM RIDESTATUS WHERE Status = 'Cancelled' LIMIT 1)
WHERE BookingID = 22;
```

### B. Edit Customer Name (`RiderProfile.jsx`)
```sql
UPDATE CUSTOMER
SET FirstName = 'Rahul', MiddleName = 'Kumar', LastName = 'Patel'
WHERE CustomerID = 5;
```

### C. Edit Location Address (`RiderProfile.jsx` / `SearchDestination.jsx`)
```sql
UPDATE LOCATION
SET HouseNo_Building = '25', Street_Road = 'MG Road', Locality = 'Navrangpura', Pincode = '380009'
WHERE LocationID = 11;
```

### D. Edit Driver Rating or Vehicle Details (`DriverProfile.jsx` / `Admin VehicleManagement.jsx`)
```sql
UPDATE DRIVER
SET DriverRating = 4.90, YearOfExperience = 9
WHERE DriverID = 1;

UPDATE VEHICLE
SET Vehiclecolor = 'Pearl White', VehicleModel = 'Swift Dzire ZXi'
WHERE Vehiclecode = 'VH001';
```

### E. Edit Promo Code Discount or Expiry (`Admin PromoManagement.jsx`)
```sql
UPDATE PROMOCODE
SET Discount = 60.00, ExpiryDate = '2026-12-31'
WHERE Code = 'FIRST50';
```

---

## 4. Useful SELECT (JOIN) Queries for GUI Screens & Viva Explanation

### Full Booking Summary (Used in `RideHistory.jsx` & `Admin RideManagement.jsx`)
```sql
SELECT
    b.BookingID,
    b.BookingDate,
    b.BookingTime,
    CONCAT(c.FirstName, ' ', c.MiddleName, ' ', c.LastName) AS CustomerName,
    CONCAT(p.HouseNo_Building, ', ', p.Street_Road, ', ', p.Locality, ', ', p.City) AS PickupLocation,
    CONCAT(dloc.HouseNo_Building, ', ', dloc.Street_Road, ', ', dloc.Locality, ', ', dloc.City) AS DropLocation,
    b.RideType,
    b.NoOfPassengers,
    dr.DriverName,
    dr.DriverRating,
    v.VehicleModel,
    v.LincensePlateNo,
    pm.PaymentMode,
    pr.Code AS PromoCode,
    pr.Discount,
    rs.Status AS RideStatus,
    b.EstimatedFare,
    b.FinalFare,
    cf.Rating AS FeedbackRating,
    cf.Review
FROM BOOKING b
JOIN CUSTOMER c ON b.CustomerID = c.CustomerID
JOIN LOCATION p ON b.Pickup_LocationID = p.LocationID
JOIN LOCATION dloc ON b.Drop_LocationID = dloc.LocationID
LEFT JOIN PAYMENT pm ON b.PaymentID = pm.PaymentID
LEFT JOIN VEHICLE v ON b.VehicleID = v.VehicleID
LEFT JOIN DRIVER dr ON b.DriverID = dr.DriverID
LEFT JOIN PROMOCODE pr ON b.PromoCodeID = pr.PromoCodeID
LEFT JOIN RIDESTATUS rs ON b.RideStatusID = rs.RideStatusID
LEFT JOIN CUSTOMERFEEDBACK cf ON b.FeedbackID = cf.FeedbackID
ORDER BY b.BookingID DESC;
```

---

## 5. Where to Edit Queries in Code

| If you want to change... | Edit this file |
|---|---|
| PostgreSQL tables / initial seed rows | `server/database/schema.sql` |
| User / Customer SQL queries | `server/models/user.model.js` |
| Booking / Ride SQL queries | `server/models/ride.model.js` |
| Driver & Vehicle SQL queries | `server/models/driver.model.js` |
| Payment SQL queries | `server/models/payment.model.js` |
| Rating / Feedback SQL queries | `server/models/rating.model.js` |
| Admin stats & PromoCode SQL queries | `server/models/admin.model.js` |
| Frontend API base URL (for publishing online) | `client/.env` (`VITE_API_URL=...`) |

