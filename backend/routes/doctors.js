const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { db } = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all doctors with optional filtering
router.get('/', authenticateToken, [
  query('specialization').optional().trim(),
  query('location').optional().trim(),
  query('availability').optional().trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let query = 'SELECT * FROM doctors WHERE 1=1';
    const params = [];

    // Add filters
    if (req.query.specialization) {
      query += ' AND specialization LIKE ?';
      params.push(`%${req.query.specialization}%`);
    }

    if (req.query.location) {
      query += ' AND location LIKE ?';
      params.push(`%${req.query.location}%`);
    }

    if (req.query.availability) {
      query += ' AND availability LIKE ?';
      params.push(`%${req.query.availability}%`);
    }

    query += ' ORDER BY name';

    const doctors = db.prepare(query).all(...params);
    res.json(doctors);
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ message: 'Failed to fetch doctors' });
  }
});

// Get doctor by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(id);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({ message: 'Failed to fetch doctor' });
  }
});

// Create new doctor
router.post('/', authenticateToken, [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('specialization').trim().isLength({ min: 2 }).withMessage('Specialization required'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Valid gender required'),
  body('location').trim().isLength({ min: 2 }).withMessage('Location required'),
  body('availability').trim().isLength({ min: 2 }).withMessage('Availability required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, specialization, gender, location, availability } = req.body;

    const stmt = db.prepare('INSERT INTO doctors (name, specialization, gender, location, availability) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(name, specialization, gender, location, availability);

    const newDoctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json({
      message: 'Doctor created successfully',
      doctor: newDoctor
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({ message: 'Failed to create doctor' });
  }
});

// Update doctor
router.put('/:id', authenticateToken, [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('specialization').trim().isLength({ min: 2 }).withMessage('Specialization required'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Valid gender required'),
  body('location').trim().isLength({ min: 2 }).withMessage('Location required'),
  body('availability').trim().isLength({ min: 2 }).withMessage('Availability required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, specialization, gender, location, availability } = req.body;

    const stmt = db.prepare('UPDATE doctors SET name = ?, specialization = ?, gender = ?, location = ?, availability = ? WHERE id = ?');
    const result = stmt.run(name, specialization, gender, location, availability, id);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const updatedDoctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(id);
    
    res.json({
      message: 'Doctor updated successfully',
      doctor: updatedDoctor
    });
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({ message: 'Failed to update doctor' });
  }
});

// Delete doctor
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    // Check if doctor has active appointments
    const activeAppointments = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND status = "Booked"').get(id);
    if (activeAppointments.count > 0) {
      return res.status(400).json({ message: 'Cannot delete doctor with active appointments' });
    }

    const stmt = db.prepare('DELETE FROM doctors WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ message: 'Failed to delete doctor' });
  }
});

module.exports = router;