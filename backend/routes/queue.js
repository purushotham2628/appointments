const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get current queue with patient details
router.get('/', authenticateToken, (req, res) => {
  try {
    const queue = db.prepare(`
      SELECT 
        q.*,
        p.name as patient_name,
        p.phone as patient_phone,
        p.email as patient_email
      FROM queue q
      JOIN patients p ON q.patient_id = p.id
      WHERE q.status != 'Completed'
      ORDER BY 
        CASE q.priority 
          WHEN 'Urgent' THEN 0 
          WHEN 'Normal' THEN 1 
        END,
        q.queue_number
    `).all();

    res.json(queue);
  } catch (error) {
    console.error('Get queue error:', error);
    res.status(500).json({ message: 'Failed to fetch queue' });
  }
});

// Add patient to queue
router.post('/', authenticateToken, [
  body('patient_id').isInt({ min: 1 }).withMessage('Valid patient ID required'),
  body('priority').optional().isIn(['Normal', 'Urgent']).withMessage('Valid priority required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { patient_id, priority = 'Normal' } = req.body;

    // Check if patient exists
    const patient = db.prepare('SELECT id FROM patients WHERE id = ?').get(patient_id);
    if (!patient) {
      return res.status(400).json({ message: 'Patient not found' });
    }

    // Check if patient is already in queue
    const existingEntry = db.prepare(`
      SELECT id FROM queue 
      WHERE patient_id = ? AND status IN ('Waiting', 'With Doctor')
    `).get(patient_id);

    if (existingEntry) {
      return res.status(400).json({ message: 'Patient is already in queue' });
    }

    // Get next queue number
    const lastQueue = db.prepare('SELECT MAX(queue_number) as max_number FROM queue WHERE DATE(created_at) = DATE("now")').get();
    const nextQueueNumber = (lastQueue.max_number || 0) + 1;

    const stmt = db.prepare('INSERT INTO queue (patient_id, queue_number, priority) VALUES (?, ?, ?)');
    const result = stmt.run(patient_id, nextQueueNumber, priority);

    // Get the created queue entry with patient details
    const newQueueEntry = db.prepare(`
      SELECT 
        q.*,
        p.name as patient_name,
        p.phone as patient_phone,
        p.email as patient_email
      FROM queue q
      JOIN patients p ON q.patient_id = p.id
      WHERE q.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Patient added to queue successfully',
      queueEntry: newQueueEntry
    });
  } catch (error) {
    console.error('Add to queue error:', error);
    res.status(500).json({ message: 'Failed to add patient to queue' });
  }
});

// Update queue entry status or priority
router.patch('/:id', authenticateToken, [
  body('status').optional().isIn(['Waiting', 'With Doctor', 'Completed']).withMessage('Valid status required'),
  body('priority').optional().isIn(['Normal', 'Urgent']).withMessage('Valid priority required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateFields = {};

    if (req.body.status) {
      updateFields.status = req.body.status;
    }

    if (req.body.priority) {
      updateFields.priority = req.body.priority;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    // Build dynamic update query
    const setClause = Object.keys(updateFields).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateFields);

    const stmt = db.prepare(`UPDATE queue SET ${setClause} WHERE id = ?`);
    const result = stmt.run(...values, id);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Queue entry not found' });
    }

    // Get updated queue entry with patient details
    const updatedEntry = db.prepare(`
      SELECT 
        q.*,
        p.name as patient_name,
        p.phone as patient_phone,
        p.email as patient_email
      FROM queue q
      JOIN patients p ON q.patient_id = p.id
      WHERE q.id = ?
    `).get(id);

    res.json({
      message: 'Queue entry updated successfully',
      queueEntry: updatedEntry
    });
  } catch (error) {
    console.error('Update queue error:', error);
    res.status(500).json({ message: 'Failed to update queue entry' });
  }
});

// Remove patient from queue
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare('DELETE FROM queue WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Queue entry not found' });
    }

    res.json({ message: 'Patient removed from queue successfully' });
  } catch (error) {
    console.error('Remove from queue error:', error);
    res.status(500).json({ message: 'Failed to remove patient from queue' });
  }
});

module.exports = router;