// alter-users.js
const Database = require('better-sqlite3');
const db = new Database('./data/clinic.db');

db.prepare(`ALTER TABLE users RENAME COLUMN password TO password_hash`).run();
console.log("✅ Column 'password' renamed to 'password_hash'.");
