const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all patients
router.get('/', authenticateToken, (req, res) => {
  try {
    const patients = db.prepare('SELECT * FROM patients ORDER BY name').all();
    res.json(patients);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: 'Failed to fetch patients' });
  }
});

// Create new patient
router.post('/', authenticateToken, [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').trim().isLength({ min: 10 }).withMessage('Valid phone number required'),
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail().normalizeEmail()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, email } = req.body;

    const stmt = db.prepare('INSERT INTO patients (name, phone, email) VALUES (?, ?, ?)');
    const result = stmt.run(name, phone, email || null);

    const newPatient = db.prepare('SELECT * FROM patients WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json({
      message: 'Patient created successfully',
      patient: newPatient
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ message: 'Failed to create patient' });
  }
});

// Update patient
router.put('/:id', authenticateToken, [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').trim().isLength({ min: 10 }).withMessage('Valid phone number required'),
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail().normalizeEmail()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, phone, email } = req.body;

    const stmt = db.prepare('UPDATE patients SET name = ?, phone = ?, email = ? WHERE id = ?');
    const result = stmt.run(name, phone, email || null, id);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const updatedPatient = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
    
    res.json({
      message: 'Patient updated successfully',
      patient: updatedPatient
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ message: 'Failed to update patient' });
  }
});

module.exports = router;