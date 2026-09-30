const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' }); // We are in root

async function fixPasswords() {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('password123', salt);
  console.log('New hash for password123:', hash);
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER === 'cbtr_user' ? 'root' : (process.env.DB_USER || 'root'),
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cbtr_db'
  });
  
  await connection.query('UPDATE users SET passwordHash = ?', [hash]);
  console.log('Successfully updated all users in the database to password123');
  
  process.exit(0);
}

fixPasswords();
