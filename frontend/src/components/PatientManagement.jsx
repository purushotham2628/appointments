import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import Modal from './Modal'
import LoadingSpinner from './LoadingSpinner'
import '../styles/PatientManagement.css'

const PatientManagement = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const data = await apiService.getPatients()
      setPatients(data)
    } catch (error) {
      setError('Failed to fetch patients')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingPatient) {
        await apiService.updatePatient(editingPatient.id, formData)
      } else {
        await apiService.createPatient(formData)
      }
      
      setShowModal(false)
      setEditingPatient(null)
      resetForm()
      await fetchPatients()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save patient')
    }
  }

  const handleEdit = (patient) => {
    setEditingPatient(patient)
    setFormData({
      name: patient.name,
      phone: patient.phone,
      email: patient.email || ''
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: ''
    })
    setError('')
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="patient-management">
      <div className="section-header">
        <h2>Patient Management</h2>
        <button 
          className="primary-button"
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
        >
          Add Patient
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search patients by name, phone, or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="patients-grid">
        {filteredPatients.length === 0 ? (
          <div className="empty-state">
            <p>{searchTerm ? 'No patients found matching your search' : 'No patients found'}</p>
          </div>
        ) : (
          filteredPatients.map(patient => (
            <div key={patient.id} className="patient-card">
              <div className="patient-header">
                <h3>{patient.name}</h3>
              </div>
              
              <div className="patient-details">
                <p><strong>Phone:</strong> {patient.phone}</p>
                {patient.email && <p><strong>Email:</strong> {patient.email}</p>}
                <p><strong>Added:</strong> {new Date(patient.created_at).toLocaleDateString()}</p>
              </div>
              
              <div className="patient-actions">
                <button 
                  onClick={() => handleEdit(patient)}
                  className="edit-button"
                >
                  Edit
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
          setEditingPatient(null)
          resetForm()
        }}
        title={editingPatient ? 'Edit Patient' : 'Add New Patient'}
      >
        <form onSubmit={handleSubmit} className="patient-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter patient's name"
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="Enter phone number"
            />
          </div>

          <div className="form-group">
            <label>Email (Optional)</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
            />
          </div>

          <div className="form-buttons">
            <button 
              type="button" 
              onClick={() => {
                setShowModal(false)
                setEditingPatient(null)
                resetForm()
              }}
            >
              Cancel
            </button>
            <button type="submit" className="primary-button">
              {editingPatient ? 'Update' : 'Add'} Patient
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default PatientManagement