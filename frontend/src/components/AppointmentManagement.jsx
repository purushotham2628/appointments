import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import Modal from './Modal'
import LoadingSpinner from './LoadingSpinner'
import '../styles/AppointmentManagement.css'

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_time: '',
    status: 'Booked'
  })
  const [filters, setFilters] = useState({
    status: '',
    doctor_id: '',
    date: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAppointments()
    fetchPatients()
    fetchDoctors()
  }, [])

  useEffect(() => {
    fetchAppointments()
  }, [filters])

  const fetchAppointments = async () => {
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => value !== '')
      )
      const data = await apiService.getAppointments(cleanFilters)
      setAppointments(data)
    } catch (error) {
      setError('Failed to fetch appointments')
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

  const fetchDoctors = async () => {
    try {
      const data = await apiService.getDoctors()
      setDoctors(data)
    } catch (error) {
      console.error('Failed to fetch doctors:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingAppointment) {
        await apiService.updateAppointment(editingAppointment.id, formData)
      } else {
        await apiService.createAppointment(formData)
      }
      
      setShowModal(false)
      setEditingAppointment(null)
      resetForm()
      await fetchAppointments()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save appointment')
    }
  }

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment)
    setFormData({
      patient_id: appointment.patient_id.toString(),
      doctor_id: appointment.doctor_id.toString(),
      appointment_time: appointment.appointment_time.slice(0, 16),
      status: appointment.status
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await apiService.deleteAppointment(id)
        await fetchAppointments()
      } catch (error) {
        setError('Failed to delete appointment')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      patient_id: '',
      doctor_id: '',
      appointment_time: '',
      status: 'Booked'
    })
    setError('')
  }

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Booked': return '#3b82f6'
      case 'Completed': return '#10b981'
      case 'Cancelled': return '#ef4444'
      default: return '#6b7280'
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="appointment-management">
      <div className="section-header">
        <h2>Appointment Management</h2>
        <button 
          className="primary-button"
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
        >
          Book Appointment
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters">
        <select
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
        >
          <option value="">All Statuses</option>
          <option value="Booked">Booked</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select
          value={filters.doctor_id}
          onChange={(e) => setFilters({...filters, doctor_id: e.target.value})}
        >
          <option value="">All Doctors</option>
          {doctors.map(doctor => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({...filters, date: e.target.value})}
          placeholder="Filter by date"
        />
      </div>

      <div className="appointments-grid">
        {appointments.length === 0 ? (
          <div className="empty-state">
            <p>No appointments found</p>
          </div>
        ) : (
          appointments.map(appointment => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-header">
                <h4>{appointment.patient_name}</h4>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(appointment.status) }}
                >
                  {appointment.status}
                </span>
              </div>
              
              <div className="appointment-details">
                <p><strong>Doctor:</strong> {appointment.doctor_name}</p>
                <p><strong>Specialization:</strong> {appointment.doctor_specialization}</p>
                <p><strong>Date & Time:</strong> {formatDateTime(appointment.appointment_time)}</p>
                <p><strong>Phone:</strong> {appointment.patient_phone}</p>
                {appointment.patient_email && (
                  <p><strong>Email:</strong> {appointment.patient_email}</p>
                )}
              </div>
              
              <div className="appointment-actions">
                <button 
                  onClick={() => handleEdit(appointment)}
                  className="edit-button"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(appointment.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingAppointment(null)
          resetForm()
        }}
        title={editingAppointment ? 'Edit Appointment' : 'Book Appointment'}
      >
        <form onSubmit={handleSubmit} className="appointment-form">
          <div className="form-group">
            <label>Patient</label>
            <select
              value={formData.patient_id}
              onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
              required
              disabled={!!editingAppointment}
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
            <label>Doctor</label>
            <select
              value={formData.doctor_id}
              onChange={(e) => setFormData({...formData, doctor_id: e.target.value})}
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Date & Time</label>
            <input
              type="datetime-local"
              value={formData.appointment_time}
              onChange={(e) => setFormData({...formData, appointment_time: e.target.value})}
              required
            />
          </div>

          {editingAppointment && (
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Booked">Booked</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          )}

          <div className="form-buttons">
            <button 
              type="button" 
              onClick={() => {
                setShowModal(false)
                setEditingAppointment(null)
                resetForm()
              }}
            >
              Cancel
            </button>
            <button type="submit" className="primary-button">
              {editingAppointment ? 'Update' : 'Book'} Appointment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AppointmentManagement