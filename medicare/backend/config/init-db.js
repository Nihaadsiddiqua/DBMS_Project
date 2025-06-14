// config/init-db.js - Fixed Database initialization and seeding script
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  port: process.env.DB_PORT || 3306,
  multipleStatements: true  // Enable multiple statements
};

const initializeDatabase = async () => {
  let connection;
  
  try {
    console.log('🔄 Connecting to MySQL server...');
    
    // Connect to MySQL server (without database)
    connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Connected to MySQL server');
    
    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'hospital_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database '${dbName}' created or verified`);
    
    // Switch to the database
    await connection.query(`USE ${dbName}`);
    
    // Try to read schema file first
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    
    try {
      const schemaSQL = await fs.readFile(schemaPath, 'utf8');
      console.log('📄 Reading database schema...');
      
      // Split the SQL file into individual statements
      const statements = schemaSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      console.log(`🔧 Executing ${statements.length} SQL statements...`);
      
      // Execute each statement individually
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          try {
            await connection.query(statement);
            if (statement.toLowerCase().includes('insert')) {
              process.stdout.write('.');
            }
          } catch (error) {
            // Skip errors for statements that might already exist
            if (!error.message.includes('already exists') && 
                !error.message.includes('Duplicate entry')) {
              console.warn(`⚠️  Warning in statement ${i + 1}:`, error.message);
            }
          }
        }
      }
      console.log('\n✅ Database schema executed successfully');
      
    } catch (schemaError) {
      if (schemaError.code === 'ENOENT') {
        console.log('⚠️  Schema file not found. Creating basic tables...');
        await createBasicTables(connection);
      } else {
        throw schemaError;
      }
    }
    
    // Check if tables are created and have data
    const [patients] = await connection.query('SELECT COUNT(*) as count FROM patients');
    const [doctors] = await connection.query('SELECT COUNT(*) as count FROM doctors');
    const [appointments] = await connection.query('SELECT COUNT(*) as count FROM appointments');
    
    console.log('\n📊 Database Statistics:');
    console.log(`   Patients: ${patients[0].count}`);
    console.log(`   Doctors: ${doctors[0].count}`);
    console.log(`   Appointments: ${appointments[0].count}`);
    
    // If no data, add sample data
    if (patients[0].count === 0) {
      console.log('\n🔄 Adding sample data...');
      await addSampleData(connection);
      
      // Check again
      const [newPatients] = await connection.query('SELECT COUNT(*) as count FROM patients');
      const [newDoctors] = await connection.query('SELECT COUNT(*) as count FROM doctors');
      const [newAppointments] = await connection.query('SELECT COUNT(*) as count FROM appointments');
      
      console.log('\n📊 Updated Database Statistics:');
      console.log(`   Patients: ${newPatients[0].count}`);
      console.log(`   Doctors: ${newDoctors[0].count}`);
      console.log(`   Appointments: ${newAppointments[0].count}`);
    }
    
    console.log('\n🎉 Database initialization completed successfully!');
    console.log(`🌐 You can now start the server with: npm start`);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Check your database credentials in the .env file');
      console.error('   Make sure DB_USER and DB_PASSWORD are correct');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure MySQL server is running');
      console.error('   Try: sudo systemctl start mysql (Linux) or brew services start mysql (macOS)');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
};

const createBasicTables = async (connection) => {
  const basicTables = [
    `CREATE TABLE IF NOT EXISTS patients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      age INT NOT NULL CHECK (age >= 0 AND age <= 150),
      phone VARCHAR(20),
      email VARCHAR(100) UNIQUE NOT NULL,
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_name (name)
    )`,
    
    `CREATE TABLE IF NOT EXISTS doctors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      specialization VARCHAR(50) NOT NULL,
      phone VARCHAR(20),
      email VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_specialization (specialization),
      INDEX idx_email (email)
    )`,
    
    `CREATE TABLE IF NOT EXISTS appointments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      patient_id INT NOT NULL,
      doctor_id INT NOT NULL,
      appointment_date DATE NOT NULL,
      appointment_time TIME NOT NULL,
      status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
      FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
      INDEX idx_appointment_date (appointment_date),
      INDEX idx_patient_id (patient_id),
      INDEX idx_doctor_id (doctor_id),
      UNIQUE KEY unique_doctor_datetime (doctor_id, appointment_date, appointment_time)
    )`
  ];
  
  for (const tableSQL of basicTables) {
    await connection.query(tableSQL);
  }
  console.log('✅ Basic tables created successfully');
};

const addSampleData = async (connection) => {
  try {
    // Sample patients
    const patients = [
      ['Rajesh Kumar', 34, '+91 98765 43210', 'rajesh.kumar@email.com', '123 Nehru Road, Mumbai, Maharashtra 400001'],
      ['Priya Patel', 28, '+91 87654 32109', 'priya.patel@email.com', '456 Gandhi Street, Delhi, Delhi 110001'],
      ['Amit Sharma', 45, '+91 76543 21098', 'amit.sharma@email.com', '789 Subhash Marg, Bangalore, Karnataka 560001'],
      ['Deepa Singh', 31, '+91 65432 10987', 'deepa.singh@email.com', '321 MG Road, Chennai, Tamil Nadu 600001'],
      ['Suresh Verma', 52, '+91 54321 09876', 'suresh.verma@email.com', '654 Tilak Nagar, Pune, Maharashtra 411001'],
      ['Meera Reddy', 39, '+91 89765 23410', 'meera.reddy@email.com', '789 Jubilee Hills, Hyderabad, Telangana 500033'],
      ['Arjun Nair', 42, '+91 77665 44332', 'arjun.nair@email.com', '456 Marine Drive, Kochi, Kerala 682001'],
      ['Sonia Malhotra', 35, '+91 99887 65432', 'sonia.malhotra@email.com', '234 Civil Lines, Jaipur, Rajasthan 302001']
    ];
    
    for (const patient of patients) {
      await connection.query(
        'INSERT INTO patients (name, age, phone, email, address) VALUES (?, ?, ?, ?, ?)',
        patient
      );
    }
    console.log('✅ Sample patients added');
    
    // Sample doctors
    const doctors = [
      ['Dr. Arun Mehta', 'Cardiology', '+91 98765 12345', 'a.mehta@hospital.com'],
      ['Dr. Sneha Reddy', 'Pediatrics', '+91 87654 23456', 's.reddy@hospital.com'],
      ['Dr. Vikram Malhotra', 'Dermatology', '+91 76543 34567', 'v.malhotra@hospital.com'],
      ['Dr. Anjali Desai', 'Orthopedics', '+91 65432 45678', 'a.desai@hospital.com'],
      ['Dr. Rahul Gupta', 'Neurology', '+91 54321 56789', 'r.gupta@hospital.com']
    ];
    
    for (const doctor of doctors) {
      await connection.query(
        'INSERT INTO doctors (name, specialization, phone, email) VALUES (?, ?, ?, ?)',
        doctor
      );
    }
    console.log('✅ Sample doctors added');
    
    // Sample appointments
    const appointments = [
      [1, 1, 'CURDATE()', '09:00:00', 'Scheduled', 'Regular checkup'],
      [2, 2, 'CURDATE()', '10:30:00', 'Scheduled', 'Vaccination'],
      [3, 3, 'DATE_ADD(CURDATE(), INTERVAL 1 DAY)', '14:00:00', 'Scheduled', 'Skin examination'],
      [4, 4, 'DATE_ADD(CURDATE(), INTERVAL 2 DAY)', '15:30:00', 'Scheduled', 'Follow-up'],
      [5, 5, 'DATE_ADD(CURDATE(), INTERVAL 3 DAY)', '16:00:00', 'Scheduled', 'Consultation'],
      [6, 2, 'DATE_ADD(CURDATE(), INTERVAL 4 DAY)', '11:00:00', 'Scheduled', 'Pediatric consultation'],
      [7, 4, 'DATE_ADD(CURDATE(), INTERVAL 4 DAY)', '14:30:00', 'Scheduled', 'Orthopedic evaluation']
    ];

    
    for (const appointment of appointments) {
      await connection.query(
        `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, notes) 
         VALUES (?, ?, ${appointment[2]}, ?, ?, ?)`,
        [appointment[0], appointment[1], appointment[3], appointment[4], appointment[5]]
      );
    }
    console.log('✅ Sample appointments added');
    
  } catch (error) {
    console.warn('⚠️  Warning adding sample data:', error.message);
  }
};

const testConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      ...dbConfig,
      database: process.env.DB_NAME || 'hospital_db'
    });
    
    await connection.query('SELECT 1');
    await connection.end();
    
    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    return false;
  }
};

const dropDatabase = async () => {
  const connection = await mysql.createConnection(dbConfig);
  const dbName = process.env.DB_NAME || 'hospital_db';
  
  const confirmed = process.argv.includes('--confirm');
  if (!confirmed) {
    console.log('⚠️  To drop the database, use: npm run drop-db -- --confirm');
    return;
  }
  
  await connection.query(`DROP DATABASE IF EXISTS ${dbName}`);
  console.log(`🗑️  Database '${dbName}' dropped successfully`);
  await connection.end();
};

// CLI Commands
const command = process.argv[2];

switch (command) {
  case 'init':
    initializeDatabase();
    break;
  case 'test':
    testConnection();
    break;
  case 'drop':
    dropDatabase();
    break;
  default:
    console.log(`
🏥 Hospital Management System - Database Tools

Available commands:
  npm run init-db     - Initialize database and create tables
  npm run test-db     - Test database connection
  npm run drop-db     - Drop database (use with --confirm)

Examples:
  npm run init-db
  npm run test-db
  npm run drop-db -- --confirm
    `);
}

module.exports = {
  initializeDatabase,
  testConnection,
  dropDatabase
};