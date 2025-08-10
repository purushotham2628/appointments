const { db, initializeDatabase } = require('../models/database');

async function seedDatabase() {
  console.log("🌱 Starting database seed...");

  try {
    // Ensure all tables exist
    await initializeDatabase();
    console.log("✅ Tables initialized");

    // Clear old data
    await runAsync("DELETE FROM queue");
    await runAsync("DELETE FROM appointments");
    await runAsync("DELETE FROM patients");
    await runAsync("DELETE FROM doctors");
    await runAsync("DELETE FROM users");

    // Insert Users
    await runAsync(
      `INSERT INTO users (email, password, role) VALUES (?, ?, ?)`,
      ["admin@clinic.com", "admin123", "admin"]
    );
    await runAsync(
      `INSERT INTO users (email, password, role) VALUES (?, ?, ?)`,
      ["frontdesk@clinic.com", "frontdesk123", "frontdesk"]
    );

    // Insert Doctors
    const doctors = [
      ["Dr. Arjun Kumar", "Cardiologist"],
      ["Dr. Priya Sharma", "Dermatologist"],
      ["Dr. Ramesh Iyer", "Orthopedic"]
    ];
    for (const doc of doctors) {
      await runAsync(
        `INSERT INTO doctors (name, specialization) VALUES (?, ?)`,
        doc
      );
    }

    // Insert Patients
    const patients = [
      ["Anil Mehta", 45, "Male"],
      ["Sunita Devi", 30, "Female"],
      ["Ravi Kumar", 55, "Male"]
    ];
    for (const pat of patients) {
      await runAsync(
        `INSERT INTO patients (name, age, gender) VALUES (?, ?, ?)`,
        pat
      );
    }

    // Insert Appointments
    await runAsync(
      `INSERT INTO appointments (patient_id, doctor_id, date) VALUES (1, 1, '2025-08-15')`
    );
    await runAsync(
      `INSERT INTO appointments (patient_id, doctor_id, date) VALUES (2, 2, '2025-08-16')`
    );
    await runAsync(
      `INSERT INTO appointments (patient_id, doctor_id, date) VALUES (3, 3, '2025-08-17')`
    );

    // Insert Queue Data
    await runAsync(
      `INSERT INTO queue (appointment_id, status) VALUES (1, 'waiting')`
    );
    await runAsync(
      `INSERT INTO queue (appointment_id, status) VALUES (2, 'in-progress')`
    );
    await runAsync(
      `INSERT INTO queue (appointment_id, status) VALUES (3, 'completed')`
    );

    console.log("🎉 Seeding completed!");
    console.log("\n📋 Demo Credentials:");
    console.log("Admin: admin@clinic.com / admin123");
    console.log("Front Desk: frontdesk@clinic.com / frontdesk123");

  } catch (err) {
    console.error("❌ Error during seeding:", err.message);
  } finally {
    // Close DB connection
    db.close((err) => {
      if (err) {
        console.error("❌ Error closing database:", err.message);
      } else {
        console.log("🔒 Database connection closed.");
      }
    });
  }
}

/**
 * Helper function to run SQL queries with Promise
 */
function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// Start the seeding process
seedDatabase();
