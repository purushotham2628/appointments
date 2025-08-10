const Database = require('better-sqlite3');

// Point to the same path your backend uses
const db = new Database('./data/clinic.db');

// Show tables
const tables = db.prepare(
  "SELECT name FROM sqlite_master WHERE type='table';"
).all();
console.log("Tables:", tables);

// Show schema for each table
tables.forEach(table => {
  const schema = db.prepare(
    `SELECT sql FROM sqlite_master WHERE type='table' AND name = ?`
  ).get(table.name);
  console.log(`Schema for ${table.name}:`, schema.sql);
});
