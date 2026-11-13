-- ============================================================
-- ONLINE TRANSPORTATION SYSTEM — POSTGRESQL SCHEMA & SEED DATA
-- Course: DATABASE MANAGEMENT SYSTEMS (ECSCI24201)
-- Team: Dhruv Vansh & Rudra Patel (Adani University)
-- Includes:
--   PART A: Exact Lab-2 & Lab-3 Normalized Relational Tables
--   PART B: Extended App Tables (Auth, GPS, Wallet, Notifications)
-- ============================================================

-- ============================================================
-- PART A: LAB-2 & LAB-3 EXACT SCHEMA TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS CUSTOMER (
    CustomerID SERIAL PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    MiddleName VARCHAR(100),
    LastName VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS LOCATION (
    LocationID SERIAL PRIMARY KEY,
    HouseNo_Building VARCHAR(100),
    Street_Road VARCHAR(150),
    Locality VARCHAR(150),
    City VARCHAR(100) DEFAULT 'Ahmedabad',
    State VARCHAR(100) DEFAULT 'Gujarat',
    Pincode VARCHAR(20),
    Country VARCHAR(100) DEFAULT 'India'
);

CREATE TABLE IF NOT EXISTS PAYMENT (
    PaymentID SERIAL PRIMARY KEY,
    PaymentMode VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS RIDESTATUS (
    RideStatusID SERIAL PRIMARY KEY,
    Status VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS VEHICLE (
    VehicleID SERIAL PRIMARY KEY,
    VehicleModel VARCHAR(100) NOT NULL,
    VehicleType VARCHAR(50) NOT NULL,
    Vehiclecolor VARCHAR(50),
    Vehiclecode VARCHAR(50) UNIQUE,
    LincensePlateNo VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS DRIVER (
    DriverID SERIAL PRIMARY KEY,
    DriverName VARCHAR(150) NOT NULL,
    DriverRating DECIMAL(3, 2) DEFAULT 4.50,
    DriverContactNo VARCHAR(20) NOT NULL,
    YearOfExperience INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS PROMOCODE (
    PromoCodeID SERIAL PRIMARY KEY,
    Code VARCHAR(50) UNIQUE NOT NULL,
    Discount DECIMAL(10, 2) NOT NULL,
    ExpiryDate DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS CUSTOMERFEEDBACK (
    FeedbackID SERIAL PRIMARY KEY,
    Rating INT CHECK (Rating >= 1 AND Rating <= 5),
    Review TEXT,
    FeedbackDate DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS BOOKING (
    BookingID SERIAL PRIMARY KEY,
    BookingDate DATE NOT NULL DEFAULT CURRENT_DATE,
    BookingTime TIME NOT NULL DEFAULT CURRENT_TIME,
    RideType VARCHAR(50) NOT NULL,
    NoOfPassengers INT DEFAULT 1,
    ContactNumber VARCHAR(20),
    EstimatedDistance DECIMAL(10, 2),
    EstimatedFare DECIMAL(10, 2),
    FinalFare DECIMAL(10, 2),
    CustomerID INT REFERENCES CUSTOMER(CustomerID),
    Pickup_LocationID INT REFERENCES LOCATION(LocationID),
    Drop_LocationID INT REFERENCES LOCATION(LocationID),
    PaymentID INT REFERENCES PAYMENT(PaymentID),
    VehicleID INT REFERENCES VEHICLE(VehicleID),
    DriverID INT REFERENCES DRIVER(DriverID),
    PromoCodeID INT REFERENCES PROMOCODE(PromoCodeID),
    RideStatusID INT REFERENCES RIDESTATUS(RideStatusID),
    FeedbackID INT REFERENCES CUSTOMERFEEDBACK(FeedbackID)
);

-- ============================================================
-- SEED DATA FROM LAB-3
-- ============================================================

INSERT INTO CUSTOMER (FirstName, MiddleName, LastName) VALUES
('Aarav', 'Kumar', 'Shah'),
('Vivaan', 'Raj', 'Patel'),
('Aditya', 'Kumar', 'Mehta'),
('Krishna', 'Raj', 'Joshi'),
('Rahul', 'Kumar', 'Verma'),
('Priya', 'Raj', 'Sharma'),
('Neha', 'Kumar', 'Patel'),
('Riya', 'Jay', 'Shah'),
('Kunal', 'Raj', 'Desai'),
('Jay', 'Kumar', 'Parmar')
ON CONFLICT DO NOTHING;

INSERT INTO LOCATION (HouseNo_Building, Street_Road, Locality, City, State, Pincode, Country) VALUES
('101', 'CG Road', 'Navrangpura', 'Ahmedabad', 'Gujarat', '380009', 'India'),
('202', 'SG Highway', 'Bodakdev', 'Ahmedabad', 'Gujarat', '380054', 'India'),
('303', 'Ring Road', 'Satellite', 'Ahmedabad', 'Gujarat', '380015', 'India'),
('404', 'Ashram Road', 'Usmanpura', 'Ahmedabad', 'Gujarat', '380013', 'India'),
('505', 'University Road', 'Vastrapur', 'Ahmedabad', 'Gujarat', '380052', 'India'),
('606', 'Prahladnagar Road', 'Prahladnagar', 'Ahmedabad', 'Gujarat', '380015', 'India'),
('707', 'Bopal Road', 'Bopal', 'Ahmedabad', 'Gujarat', '380058', 'India'),
('808', 'Naroda Road', 'Naroda', 'Ahmedabad', 'Gujarat', '382330', 'India'),
('909', 'Maninagar Road', 'Maninagar', 'Ahmedabad', 'Gujarat', '380008', 'India'),
('1001', 'Chandkheda Road', 'Chandkheda', 'Ahmedabad', 'Gujarat', '382424', 'India'),
('25', 'MG Road', 'Navrangpura', 'Ahmedabad', 'Gujarat', '380009', 'India'),
('10', 'Airport Road', 'Hansol', 'Ahmedabad', 'Gujarat', '382475', 'India')
ON CONFLICT DO NOTHING;

INSERT INTO PAYMENT (PaymentMode) VALUES
('Cash'), ('UPI'), ('Credit Card'), ('Debit Card'), ('Google Pay'),
('PhonePe'), ('Paytm'), ('Net Banking'), ('Wallet'), ('Cash')
ON CONFLICT DO NOTHING;

INSERT INTO RIDESTATUS (Status) VALUES
('Booked'), ('Driver Assigned'), ('Driver Arrived'), ('Ride Started'), ('Ride Completed'),
('Cancelled'), ('Pending'), ('Confirmed'), ('In Progress'), ('Completed')
ON CONFLICT DO NOTHING;

INSERT INTO VEHICLE (VehicleModel, VehicleType, Vehiclecolor, Vehiclecode, LincensePlateNo) VALUES
('Swift Dzire', 'Sedan', 'White', 'VH001', 'GJ01AB1234'),
('Honda City', 'Sedan', 'Black', 'VH002', 'GJ01CD2345'),
('Hyundai i20', 'Hatchback', 'Blue', 'VH003', 'GJ01EF3456'),
('Toyota Innova', 'SUV', 'Silver', 'VH004', 'GJ01GH4567'),
('Maruti Ertiga', 'SUV', 'White', 'VH005', 'GJ01IJ5678'),
('Tata Nexon', 'SUV', 'Red', 'VH006', 'GJ01KL6789'),
('Hyundai Creta', 'SUV', 'Grey', 'VH007', 'GJ01MN7890'),
('Honda Amaze', 'Sedan', 'White', 'VH008', 'GJ01OP8901'),
('Maruti Baleno', 'Hatchback', 'Blue', 'VH009', 'GJ01QR9012'),
('Kia Seltos', 'SUV', 'Black', 'VH010', 'GJ01ST0123')
ON CONFLICT DO NOTHING;

INSERT INTO DRIVER (DriverName, DriverRating, DriverContactNo, YearOfExperience) VALUES
('Ramesh Patel', 4.80, '9876543210', 8),
('Suresh Shah', 4.50, '9876543211', 6),
('Mahesh Kumar', 4.70, '9876543212', 10),
('Rajesh Patel', 4.60, '9876543213', 7),
('Amit Shah', 4.90, '9876543214', 12),
('Vijay Parmar', 4.40, '9876543215', 5),
('Kiran Joshi', 4.75, '9876543216', 9),
('Manoj Desai', 4.55, '9876543217', 6),
('Deepak Patel', 4.85, '9876543218', 11),
('Harsh Shah', 4.65, '9876543219', 7)
ON CONFLICT DO NOTHING;

INSERT INTO PROMOCODE (Code, Discount, ExpiryDate) VALUES
('WELCOME10', 10.00, '2026-12-31'),
('RIDE20', 20.00, '2026-10-31'),
('FIRST50', 50.00, '2026-09-30'),
('SAVE15', 15.00, '2026-11-30'),
('FESTIVE25', 25.00, '2026-10-15'),
('NEWUSER30', 30.00, '2026-12-15'),
('SUMMER10', 10.00, '2026-08-31'),
('MONSOON20', 20.00, '2026-09-15'),
('SPECIAL40', 40.00, '2026-12-01'),
('RIDE100', 100.00, '2026-12-31')
ON CONFLICT DO NOTHING;

INSERT INTO CUSTOMERFEEDBACK (Rating, Review, FeedbackDate) VALUES
(5, 'Excellent ride and friendly driver', '2026-08-01'),
(4, 'Good service', '2026-08-02'),
(5, 'Very comfortable journey', '2026-08-03'),
(3, 'Average experience', '2026-08-04'),
(4, 'Driver was polite and helpful', '2026-08-05'),
(5, 'Great service and clean vehicle', '2026-08-06'),
(4, 'Good ride but slightly late', '2026-08-07'),
(5, 'Amazing experience', '2026-08-08'),
(3, 'Vehicle was okay', '2026-08-09'),
(5, 'Highly recommended', '2026-08-10')
ON CONFLICT DO NOTHING;

INSERT INTO BOOKING (
    BookingDate, BookingTime, RideType, NoOfPassengers, ContactNumber,
    EstimatedDistance, EstimatedFare, FinalFare,
    CustomerID, Pickup_LocationID, Drop_LocationID, PaymentID,
    VehicleID, DriverID, PromoCodeID, RideStatusID, FeedbackID
) VALUES
('2026-08-01', '09:00:00', 'Sedan', 2, '9876500001', 9.4, 195.00, 185.00, 1, 1, 2, 1, 1, 1, 1, 5, 1),
('2026-08-02', '10:30:00', 'SUV', 4, '9876500002', 6.2, 260.00, 240.00, 2, 2, 3, 2, 2, 2, 2, 5, 2),
('2026-08-03', '11:00:00', 'Hatchback', 1, '9876500003', 4.5, 140.00, 90.00, 3, 3, 4, 3, 3, 3, 3, 5, 3),
('2026-08-04', '12:15:00', 'SUV', 5, '9876500004', 7.1, 225.00, 210.00, 4, 4, 5, 4, 4, 4, 4, 5, 4),
('2026-08-05', '14:00:00', 'Sedan', 3, '9876500005', 5.8, 190.00, 165.00, 5, 5, 6, 5, 5, 5, 5, 5, 5),
('2026-08-06', '15:30:00', 'SUV', 4, '9876500006', 8.0, 280.00, 250.00, 6, 6, 7, 6, 6, 6, 6, 5, 6),
('2026-08-07', '16:00:00', 'Hatchback', 2, '9876500007', 11.2, 210.00, 200.00, 7, 7, 8, 7, 7, 7, 7, 5, 7),
('2026-08-08', '17:45:00', 'Sedan', 2, '9876500008', 10.5, 270.00, 250.00, 8, 8, 9, 8, 8, 8, 8, 5, 8),
('2026-08-09', '18:30:00', 'Hatchback', 1, '9876500009', 12.0, 240.00, 200.00, 9, 9, 10, 9, 9, 9, 9, 5, 9),
('2026-08-10', '20:00:00', 'SUV', 4, '9876500010', 9.8, 320.00, 220.00, 10, 10, 1, 10, 10, 10, 10, 5, 10);

-- ============================================================
-- PART B: FULL-STACK APP TABLES (AUTH, GPS, WALLET, REAL-TIME)
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('rider', 'driver', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS drivers (
    driver_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    years_of_experience INT DEFAULT 1,
    is_available BOOLEAN DEFAULT false,
    current_lat DECIMAL(10, 7) DEFAULT 23.0365,
    current_lng DECIMAL(10, 7) DEFAULT 72.5611,
    rating DECIMAL(3, 2) DEFAULT 5.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id SERIAL PRIMARY KEY,
    driver_id INT REFERENCES drivers(driver_id) ON DELETE CASCADE,
    vehicle_type VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(50),
    vehicle_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rides (
    ride_id SERIAL PRIMARY KEY,
    rider_id INT REFERENCES users(user_id),
    driver_id INT REFERENCES drivers(driver_id),
    pickup_lat DECIMAL(10, 7) NOT NULL,
    pickup_lng DECIMAL(10, 7) NOT NULL,
    pickup_address TEXT NOT NULL,
    drop_lat DECIMAL(10, 7) NOT NULL,
    drop_lng DECIMAL(10, 7) NOT NULL,
    drop_address TEXT NOT NULL,
    vehicle_type VARCHAR(50) DEFAULT 'sedan',
    no_of_passengers INT DEFAULT 1,
    status VARCHAR(30) DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'arriving', 'in_progress', 'completed', 'cancelled')),
    fare DECIMAL(10, 2) NOT NULL,
    distance_km DECIMAL(10, 2),
    duration_min INT,
    otp VARCHAR(6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    payment_id SERIAL PRIMARY KEY,
    ride_id INT REFERENCES rides(ride_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'upi',
    payment_status VARCHAR(30) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ratings (
    rating_id SERIAL PRIMARY KEY,
    ride_id INT REFERENCES rides(ride_id) ON DELETE CASCADE,
    rated_by INT REFERENCES users(user_id),
    rated_to INT REFERENCES users(user_id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS promo_codes (
    promo_id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent DECIMAL(5, 2) NOT NULL,
    max_discount DECIMAL(10, 2) DEFAULT 100.00,
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_to TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '180 days'),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS saved_addresses (
    address_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    lat DECIMAL(10, 7),
    lng DECIMAL(10, 7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO promo_codes (code, discount_percent, max_discount) VALUES
('WELCOME10', 10, 50),
('RIDE20', 20, 100),
('FIRST50', 50, 150),
('FESTIVE25', 25, 120),
('RIDE100', 30, 100)
ON CONFLICT DO NOTHING;

