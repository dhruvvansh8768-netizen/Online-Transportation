const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const bcrypt = require('bcrypt');
const { pool } = require('../config/db');

async function seed() {
  try {
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('123456', salt);

    // Upsert admin user
    const adminCheck = await pool.query(
      `SELECT * FROM users WHERE email = 'rj423513@gmail.com'`
    );

    if (adminCheck.rows.length === 0) {
      await pool.query(
        `INSERT INTO users (full_name, email, phone, password_hash, role, is_active)
         VALUES ('Rudra Patel (Admin)', 'rj423513@gmail.com', '6353180208', $1, 'admin', true)`,
        [adminHash]
      );
      console.log('Admin user rj423513@gmail.com created successfully!');
    } else {
      await pool.query(
        `UPDATE users SET password_hash = $1, role = 'admin', is_active = true WHERE email = 'rj423513@gmail.com'`,
        [adminHash]
      );
      console.log('Admin user rj423513@gmail.com updated with password 123456!');
    }

    const res = await pool.query(`SELECT user_id, full_name, email, role FROM users WHERE email = 'rj423513@gmail.com'`);
    console.log('Admin record verified:', res.rows[0]);
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await pool.end();
  }
}

seed();
