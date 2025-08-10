// hash-password.js
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

const db = new Database('./data/clinic.db');
const email = 'frontdesk@clinic.com';
const plainPassword = 'admin123'; // the actual password for this account

const hashed = bcrypt.hashSync(plainPassword, 10);
db.prepare(`UPDATE users SET password_hash = ? WHERE email = ?`).run(hashed, email);

console.log(`✅ Updated ${email} with hashed password.`);
