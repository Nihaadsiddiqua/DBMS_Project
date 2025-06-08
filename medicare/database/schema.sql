-- Database Schema for Hospital Management System
-- Run this file to create the database and tables with sample data

-- Create database
CREATE DATABASE IF NOT EXISTS hospitalData;
USE hospitalData;

-- Drop existing tables (if you want to recreate)
-- DROP TABLE IF EXISTS appointments;
-- DROP TABLE IF EXISTS doctors;
-- DROP TABLE IF EXISTS patients;

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL CHECK (age >= 0 AND age <= 150),
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for better performance
    INDEX idx_email (email),
    INDEX idx_name (name),
    INDEX idx_created_at (created_at)
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for better performance
    INDEX idx_specialization (specialization),
    INDEX idx_email (email),
    INDEX idx_name (name)
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    
    -- Indexes for better performance
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_status (status),
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_datetime (appointment_date, appointment_time),
    
    -- Unique constraint to prevent double-booking
    UNIQUE KEY unique_doctor_datetime (doctor_id, appointment_date, appointment_time)
);

-- Insert sample patients
INSERT INTO patients (name, age, phone, email, address) VALUES
('Rajesh Kumar', 34, '+91 98765-43210', 'rajesh.kumar@email.com', '123 Gandhi Road, Mumbai, MH 400001'),
('Priya Patel', 28, '+91 87654-32109', 'priya.patel@email.com', '456 Nehru Street, Delhi, DL 110001'),
('Amit Sharma', 45, '+91 76543-21098', 'amit.sharma@email.com', '789 Tagore Lane, Bangalore, KA 560001'),
('Deepa Verma', 31, '+91 65432-10987', 'deepa.verma@email.com', '321 Bose Road, Kolkata, WB 700001'),
('Suresh Reddy', 52, '+91 54321-09876', 'suresh.reddy@email.com', '654 Krishna Nagar, Chennai, TN 600001'),
('Anita Singh', 29, '+91 43210-98765', 'anita.singh@email.com', '987 Shivaji Path, Pune, MH 411001'),
('Vikram Malhotra', 67, '+91 32109-87654', 'vikram.malhotra@email.com', '147 Subhash Marg, Jaipur, RJ 302001'),
('Meera Gupta', 23, '+91 21098-76543', 'meera.gupta@email.com', '258 Patel Nagar, Ahmedabad, GJ 380001'),
('Arjun Nair', 41, '+91 10987-65432', 'arjun.nair@email.com', '369 MG Road, Kochi, KL 682001'),
('Kavita Iyer', 38, '+91 09876-54321', 'kavita.iyer@email.com', '741 Anna Salai, Hyderabad, TS 500001');

-- Insert sample doctors
INSERT INTO doctors (name, specialization, phone, email) VALUES
('Dr. Arun Mehta', 'Cardiology', '+91 98765-11111', 'a.mehta@apollohospital.com'),
('Dr. Sanjay Desai', 'Pediatrics', '+91 98765-22222', 's.desai@apollohospital.com'),
('Dr. Priya Ranjan', 'Dermatology', '+91 98765-33333', 'p.ranjan@apollohospital.com'),
('Dr. Rahul Kapoor', 'Orthopedics', '+91 98765-44444', 'r.kapoor@apollohospital.com'),
('Dr. Neha Sharma', 'Neurology', '+91 98765-55555', 'n.sharma@apollohospital.com'),
('Dr. Vijay Patel', 'Internal Medicine', '+91 98765-66666', 'v.patel@apollohospital.com'),
('Dr. Sunita Reddy', 'Pediatrics', '+91 98765-77777', 's.reddy@apollohospital.com'),
('Dr. Rajesh Gupta', 'Cardiology', '+91 98765-88888', 'r.gupta@apollohospital.com'),
('Dr. Anjali Verma', 'Psychiatry', '+91 98765-99999', 'a.verma@apollohospital.com'),
('Dr. Karthik Iyer', 'Emergency Medicine', '+91 98765-00000', 'k.iyer@apollohospital.com');

-- Insert sample appointments
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, notes) VALUES
-- Today's appointments
(1, 1, CURDATE(), '09:00:00', 'Scheduled', 'Regular checkup for heart condition'),
(2, 2, CURDATE(), '10:30:00', 'Completed', 'Child vaccination - MMR'),
(3, 3, CURDATE(), '14:00:00', 'Scheduled', 'Skin rash examination'),
(4, 4, CURDATE(), '15:30:00', 'Completed', 'Knee injury follow-up'),
(5, 5, CURDATE(), '16:00:00', 'Cancelled', 'Patient requested reschedule'),

-- Tomorrow's appointments
(6, 6, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '08:30:00', 'Scheduled', 'Annual physical examination'),
(7, 7, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '11:00:00', 'Scheduled', 'Child wellness visit'),
(8, 8, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '13:00:00', 'Scheduled', 'Cardiac stress test'),
(9, 9, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:30:00', 'Scheduled', 'Mental health consultation'),
(10, 10, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '16:00:00', 'Scheduled', 'Emergency follow-up'),

-- Yesterday's appointments
(1, 6, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:00:00', 'Completed', 'Blood pressure monitoring'),
(3, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '11:30:00', 'Completed', 'EKG test results review'),
(5, 4, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '14:00:00', 'Completed', 'Physical therapy evaluation'),
(7, 2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '15:30:00', 'Completed', 'Growth chart review'),
(9, 5, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '10:00:00', 'Cancelled', 'Weather-related cancellation'),

-- Future appointments (next week)
(2, 3, DATE_ADD(CURDATE(), INTERVAL 7 DAY), '09:30:00', 'Scheduled', 'Mole examination'),
(4, 1, DATE_ADD(CURDATE(), INTERVAL 7 DAY), '11:00:00', 'Scheduled', 'Cardiology consultation'),
(6, 5, DATE_ADD(CURDATE(), INTERVAL 7 DAY), '14:00:00', 'Scheduled', 'Neurological assessment'),
(8, 7, DATE_ADD(CURDATE(), INTERVAL 7 DAY), '15:30:00', 'Scheduled', 'Pediatric consultation'),
(10, 6, DATE_ADD(CURDATE(), INTERVAL 7 DAY), '16:30:00', 'Scheduled', 'Follow-up examination');

-- Create views for common queries
CREATE OR REPLACE VIEW patient_appointment_summary AS
SELECT 
    p.id as patient_id,
    p.name as patient_name,
    p.email as patient_email,
    COUNT(a.id) as total_appointments,
    COUNT(CASE WHEN a.status = 'Completed' THEN 1 END) as completed_appointments,
    COUNT(CASE WHEN a.status = 'Scheduled' THEN 1 END) as scheduled_appointments,
    COUNT(CASE WHEN a.status = 'Cancelled' THEN 1 END) as cancelled_appointments,
    MAX(a.appointment_date) as last_appointment_date
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
GROUP BY p.id, p.name, p.email;

CREATE OR REPLACE VIEW doctor_appointment_summary AS
SELECT 
    d.id as doctor_id,
    d.name as doctor_name,
    d.specialization,
    COUNT(a.id) as total_appointments,
    COUNT(CASE WHEN a.status = 'Completed' THEN 1 END) as completed_appointments,
    COUNT(CASE WHEN a.status = 'Scheduled' THEN 1 END) as scheduled_appointments,
    COUNT(CASE WHEN DATE(a.appointment_date) = CURDATE() THEN 1 END) as todays_appointments
FROM doctors d
LEFT JOIN appointments a ON d.id = a.doctor_id
GROUP BY d.id, d.name, d.specialization;

CREATE OR REPLACE VIEW todays_schedule AS
SELECT 
    a.id as appointment_id,
    a.appointment_time,
    a.status,
    p.name as patient_name,
    p.phone as patient_phone,
    d.name as doctor_name,
    d.specialization,
    a.notes
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN doctors d ON a.doctor_id = d.id
WHERE DATE(a.appointment_date) = CURDATE()
ORDER BY a.appointment_time;

-- Show summary after creation
SELECT 'Database initialized successfully!' as status;
SELECT COUNT(*) as total_patients FROM patients;
SELECT COUNT(*) as total_doctors FROM doctors;
SELECT COUNT(*) as total_appointments FROM appointments;
SELECT COUNT(*) as todays_appointments FROM appointments WHERE DATE(appointment_date) = CURDATE();