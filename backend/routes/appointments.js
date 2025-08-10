const express = require('express');
const { body, validationResult, query } = require('express-validator');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all appointments with patient and doctor details
router.get('/', authenticateToken, [
  query('status').optional().isIn(['Booked', 'Completed', 'Cancelled']),
  query('doctor_id').optional().isInt(),
  query('date').optional().isISO8601()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let query = `
      SELECT 
        a.*,
        p.name as patient_name,
        p.phone as patient_phone,
        p.email as patient_email,
        d.name as doctor_name,
        d.specialization as doctor_specialization
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE 1=1
    `;
    const params = [];

    // Add filters
    if (req.query.status) {
      query += ' AND a.status = ?';
      params.push(req.query.status);
    }

    if (req.query.doctor_id) {
      query += ' AND a.doctor_id = ?';
      params.push(req.query.doctor_id);
    }

    if (req.query.date) {
      query += ' AND DATE(a.appointment_time) = DATE(?)';
      params.push(req.query.date);
    }

    query += ' ORDER BY a.appointment_time';

    const appointments = db.prepare(query).all(...params);
    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

// Create new appointment
router.post('/', authenticateToken, [
  body('patient_id').isInt({ min: 1 }).withMessage('Valid patient ID required'),
  body('doctor_id').isInt({ min: 1 }).withMessage('Valid doctor ID required'),
  body('appointment_time').isISO8601().withMessage('Valid datetime required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { patient_id, doctor_id, appointment_time } = req.body;

    // Check if patient exists
    const patient = db.prepare('SELECT id FROM patients WHERE id = ?').get(patient_id);
    if (!patient) {
      return res.status(400).json({ message: 'Patient not found' });
    }

    // Check if doctor exists
    const doctor = db.prepare('SELECT id FROM doctors WHERE id = ?').get(doctor_id);
    if (!doctor) {
      return res.status(400).json({ message: 'Doctor not found' });
    }

    // Check for conflicting appointments
    const conflict = db.prepare(`
      SELECT id FROM appointments 
      WHERE doctor_id = ? 
        AND appointment_time = ? 
        AND status = 'Booked'
    `).get(doctor_id, appointment_time);

    if (conflict) {
      return res.status(400).json({ message: 'Doctor already has an appointment at this time' });
    }

    const stmt = db.prepare('INSERT INTO appointments (patient_id, doctor_id, appointment_time) VALUES (?, ?, ?)');
    const result = stmt.run(patient_id, doctor_id, appointment_time);

    // Get the created appointment with details
    const newAppointment = db.prepare(`
      SELECT 
        a.*,
        p.name as patient_name,
        p.phone as patient_phone,
        d.name as doctor_name,
        d.specialization as doctor_specialization
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: newAppointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Failed to create appointment' });
  }
});

// Update appointment
router.put('/:id', authenticateToken, [
  body('appointment_time').optional().isISO8601().withMessage('Valid datetime required'),
  body('status').optional().isIn(['Booked', 'Completed', 'Cancelled']).withMessage('Valid status required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateFields = {};
    
    if (req.body.appointment_time) {
      updateFields.appointment_time = req.body.appointment_time;
    }
    
    if (req.body.status) {
      updateFields.status = req.body.status;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    // Check for conflicts if updating appointment time
    if (updateFields.appointment_time) {
      const appointment = db.prepare('SELECT doctor_id FROM appointments WHERE id = ?').get(id);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      const conflict = db.prepare(`
        SELECT id FROM appointments 
        WHERE doctor_id = ? 
          AND appointment_time = ? 
          AND status = 'Booked'
          AND id != ?
      `).get(appointment.doctor_id, updateFields.appointment_time, id);

      if (conflict) {
        return res.status(400).json({ message: 'Doctor already has an appointment at this time' });
      }
    }

    // Build dynamic update query
    const setClause = Object.keys(updateFields).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateFields);
    
    const stmt = db.prepare(`UPDATE appointments SET ${setClause} WHERE id = ?`);
    const result = stmt.run(...values, id);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Get updated appointment with details
    const updatedAppointment = db.prepare(`
      SELECT 
        a.*,
        p.name as patient_name,
        p.phone as patient_phone,
        d.name as doctor_name,
        d.specialization as doctor_specialization
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.id = ?
    `).get(id);

    res.json({
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Failed to update appointment' });
  }
});

// Delete appointment
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare('DELETE FROM appointments WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ message: 'Failed to delete appointment' });
  }
});

module.exports = router;