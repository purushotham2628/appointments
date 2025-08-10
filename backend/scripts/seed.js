const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, '../data/clinic.db');
const db = new Database(dbPath);

/**
 * Main seeding function
 */
async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data (in correct order due to foreign keys)
    db.prepare('DELETE FROM queue').run();
    db.prepare('DELETE FROM appointments').run();
    db.prepare('DELETE FROM patients').run();
    db.prepare('DELETE FROM doctors').run();
    db.prepare('DELETE FROM users').run();

    console.log("🗑️  Cleared existing data");

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const frontDeskPassword = await bcrypt.hash('frontdesk123', 10);

    // Insert Users
    const insertUser = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
    insertUser.run('Admin User', 'admin@clinic.com', adminPassword, 'admin');
    insertUser.run('Front Desk Staff', 'frontdesk@clinic.com', frontDeskPassword, 'front_desk');

    console.log("👤 Inserted users");

    // Insert Doctors
    const insertDoctor = db.prepare('INSERT INTO doctors (name, specialization, gender, location, availability) VALUES (?, ?, ?, ?, ?)');
    insertDoctor.run('Dr. Sarah Johnson', 'Cardiology', 'Female', 'Building A, Floor 2', 'Mon-Fri 9AM-5PM');
    insertDoctor.run('Dr. Michael Chen', 'Pediatrics', 'Male', 'Building B, Floor 1', 'Mon-Wed 8AM-4PM');
    insertDoctor.run('Dr. Emily Rodriguez', 'Dermatology', 'Female', 'Building A, Floor 3', 'Tue-Thu 10AM-6PM');
    insertDoctor.run('Dr. David Kumar', 'Orthopedics', 'Male', 'Building C, Floor 2', 'Mon-Fri 7AM-3PM');

    console.log("👨‍⚕️ Inserted doctors");

    // Insert Patients
    const insertPatient = db.prepare('INSERT INTO patients (name, age, gender, phone, email) VALUES (?, ?, ?, ?, ?)');
    insertPatient.run('John Smith', 45, 'Male', '555-0101', 'john.smith@email.com');
    insertPatient.run('Maria Garcia', 32, 'Female', '555-0102', 'maria.garcia@email.com');
    insertPatient.run('Robert Johnson', 67, 'Male', '555-0103', 'robert.johnson@email.com');
    insertPatient.run('Lisa Wang', 28, 'Female', '555-0104', 'lisa.wang@email.com');

    console.log("🏥 Inserted patients");

    // Insert Appointments
    const insertAppointment = db.prepare('INSERT INTO appointments (patient_id, doctor_id, appointment_time, status) VALUES (?, ?, ?, ?)');
    insertAppointment.run(1, 1, '2024-01-15 10:00:00', 'scheduled');
    insertAppointment.run(2, 2, '2024-01-15 11:00:00', 'scheduled');
    insertAppointment.run(3, 3, '2024-01-15 14:00:00', 'completed');
    insertAppointment.run(4, 4, '2024-01-16 09:00:00', 'scheduled');

    console.log("📅 Inserted appointments");

    // Insert Queue Data
    const insertQueue = db.prepare('INSERT INTO queue (patient_id, appointment_id, queue_number, status) VALUES (?, ?, ?, ?)');
    insertQueue.run(1, 1, 1, 'waiting');
    insertQueue.run(2, 2, 2, 'in-progress');
    insertQueue.run(4, 4, 3, 'waiting');

    console.log("⏳ Inserted queue data");

    console.log("🎉 Seeding completed!");
    console.log("\n📋 Demo Credentials:");
    console.log("Admin: admin@clinic.com / admin123");
    console.log("Front Desk: frontdesk@clinic.com / frontdesk123");

  } catch (err) {
    console.error("❌ Error during seeding:", err.message);
    throw err;
  } finally {
    // Close DB connection
    db.close();
    console.log("🔒 Database connection closed.");
  }
}

// Start the seeding process
seedDatabase().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});