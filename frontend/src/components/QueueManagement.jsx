import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import Modal from './Modal'
import LoadingSpinner from './LoadingSpinner'
import '../styles/QueueManagement.css'

const QueueManagement = () => {
  const [queue, setQueue] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState('')
  const [priority, setPriority] = useState('Normal')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchQueue()
    fetchPatients()
  }, [])

  const fetchQueue = async () => {
    try {
      const data = await apiService.getQueue()
      setQueue(data)
    } catch (error) {
      setError('Failed to fetch queue')
    } finally {
      setLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const data = await apiService.getPatients()
      setPatients(data)
    } catch (error) {
      console.error('Failed to fetch patients:', error)
    }
  }

  const handleAddToQueue = async (e) => {
    e.preventDefault()
    
    if (!selectedPatient) {
      setError('Please select a patient')
      return
    }

    try {
      await apiService.addToQueue({
        patient_id: parseInt(selectedPatient),
        priority
      })
      
      setShowAddModal(false)
      setSelectedPatient('')
      setPriority('Normal')
      setError('')
      await fetchQueue()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add patient to queue')
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await apiService.updateQueue(id, { status: newStatus })
      await fetchQueue()
    } catch (error) {
      setError('Failed to update queue status')
    }
  }

  const handlePriorityUpdate = async (id, newPriority) => {
    try {
      await apiService.updateQueue(id, { priority: newPriority })
      await fetchQueue()
    } catch (error) {
      setError('Failed to update queue priority')
    }
  }

  const handleRemoveFromQueue = async (id) => {
    if (window.confirm('Remove patient from queue?')) {
      try {
        await apiService.removeFromQueue(id)
        await fetchQueue()
      } catch (error) {
        setError('Failed to remove patient from queue')
      }
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Waiting': return '#f59e0b'
      case 'With Doctor': return '#10b981'
      case 'Completed': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getPriorityColor = (priority) => {
    return priority === 'Urgent' ? '#ef4444' : '#6b7280'
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="queue-management">
      <div className="section-header">
        <h2>Queue Management</h2>
        <button 
          className="primary-button"
          onClick={() => setShowAddModal(true)}
        >
          Add to Queue
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="queue-stats">
        <div className="stat-card">
          <div className="stat-number">{queue.filter(q => q.status === 'Waiting').length}</div>
          <div className="stat-label">Waiting</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{queue.filter(q => q.status === 'With Doctor').length}</div>
          <div className="stat-label">With Doctor</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{queue.filter(q => q.priority === 'Urgent').length}</div>
          <div className="stat-label">Urgent</div>
        </div>
      </div>

      <div className="queue-list">
        {queue.length === 0 ? (
          <div className="empty-state">
            <p>No patients in queue</p>
          </div>
        ) : (
          queue.map(entry => (
            <div key={entry.id} className="queue-item">
              <div className="queue-number">#{entry.queue_number}</div>
              
              <div className="patient-info">
                <h4>{entry.patient_name}</h4>
                <p>{entry.patient_phone}</p>
                {entry.patient_email && <p className="patient-email">{entry.patient_email}</p>}
              </div>

              <div className="queue-status">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(entry.status) }}
                >
                  {entry.status}
                </span>
                <span 
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(entry.priority) }}
                >
                  {entry.priority}
                </span>
              </div>

              <div className="queue-actions">
                <select
                  value={entry.status}
                  onChange={(e) => handleStatusUpdate(entry.id, e.target.value)}
                  className="status-select"
                >
                  <option value="Waiting">Waiting</option>
                  <option value="With Doctor">With Doctor</option>
                  <option value="Completed">Completed</option>
                </select>

                <select
                  value={entry.priority}
                  onChange={(e) => handlePriorityUpdate(entry.id, e.target.value)}
                  className="priority-select"
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                </select>

                <button
                  onClick={() => handleRemoveFromQueue(entry.id)}
                  className="remove-button"
                  title="Remove from queue"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setError('')
        }}
        title="Add Patient to Queue"
      >
        <form onSubmit={handleAddToQueue} className="add-queue-form">
          <div className="form-group">
            <label>Patient</label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              required
            >
              <option value="">Select Patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} - {patient.phone}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div className="form-buttons">
            <button type="button" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
            <button type="submit" className="primary-button">
              Add to Queue
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default QueueManagement