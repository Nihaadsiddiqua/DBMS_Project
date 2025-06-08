# Hospital Management System Backend Setup

## Database Setup Instructions

1. First, ensure MySQL is installed and running on your system

2. Log into MySQL as root and create a new user:
```sql
mysql -u root -p
CREATE USER 'hospital_admin'@'localhost' IDENTIFIED BY 'hospital123';
GRANT ALL PRIVILEGES ON *.* TO 'hospital_admin'@'localhost';
FLUSH PRIVILEGES;
```

3. Create the database:
```sql
CREATE DATABASE hospital_db;
```

4. Update your .env file with these credentials:
```env
DB_HOST=localhost
DB_USER=hospital_admin
DB_PASSWORD=hospital123
DB_NAME=hospital_db
```

5. Initialize the database:
```bash
npm run init-db
```

6. Start the server:
```bash
npm run dev
```

## Troubleshooting

If you see "Access denied for user 'root'@'localhost'", make sure to:
1. Update the .env file with correct credentials
2. Create the database user as shown above
3. Grant necessary privileges to the user
4. Restart the server after making changes