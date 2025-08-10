// create-admin.js
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to your existing database
const dbPath = path.join(__dirname, 'data', 'clinic.db');
const db = new sqlite3.Database(dbPath);

// Admin credentials
const name = 'Admin';
const email = 'admin@clinic.com';
const password = 'admin123'; // change if you want
const role = 'admin';

// Hash the password
bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('❌ Error hashing password:', err);
    db.close();
    return;
  }

  // Try update first
  db.run(
    `UPDATE users 
     SET name = ?, password_hash = ?, role = ? 
     WHERE email = ?`,
    [name, hash, role, email],
    function (err) {
      if (err) {
        console.error('❌ Error updating admin:', err.message);
        db.close();
        return;
      }

      if (this.changes === 0) {
        // No existing account, insert new one
        db.run(
          `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
          [name, email, hash, role],
          function (err) {
            if (err) {
              console.error('❌ Error inserting admin:', err.message);
            } else {
              console.log('✅ Admin user created successfully');
            }
            db.close();
          }
        );
      } else {
        console.log('✅ Admin user updated successfully');
        db.close();
      }
    }
  );
});
