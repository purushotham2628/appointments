import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import Modal from './Modal'
import LoadingSpinner from './LoadingSpinner'
import '../styles/DoctorManagement.css'

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    gender: 'Male',
    location: '',
    availability: ''
  })
  const [searchFilters, setSearchFilters] = useState({
    specialization: '',
    location: '',
    availability: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDoctors()
  }, [])

  useEffect(() => {
    fetchDoctors()
  }, [searchFilters])

  const fetchDoctors = async () => {
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(searchFilters).filter(([key, value]) => value !== '')
      )
      const data = await apiService.getDoctors(cleanFilters)
      setDoctors(data)
    } catch (error) {
      setError('Failed to fetch doctors')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingDoctor) {
        await apiService.updateDoctor(editingDoctor.id, formData)
      } else {
        await apiService.createDoctor(formData)
      }
      
      setShowModal(false)
      setEditingDoctor(null)
      resetForm()
      await fetchDoctors()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save doctor')
    }
  }

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor)
    setFormData({
      name: doctor.name,
      specialization: doctor.specialization,
      gender: doctor.gender,
      location: doctor.location,
      availability: doctor.availability
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await apiService.deleteDoctor(id)
        await fetchDoctors()
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete doctor')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      specialization: '',
      gender: 'Male',
      location: '',
      availability: ''
    })
    setError('')
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFilterChange = (e) => {
    setSearchFilters({
      ...searchFilters,
      [e.target.name]: e.target.value
    })
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="doctor-management">
      <div className="section-header">
        <h2>Doctor Management</h2>
        <button 
          className="primary-button"
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
        >
          Add Doctor
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="search-filters">
        <input
          type="text"
          name="specialization"
          placeholder="Search by specialization"
          value={searchFilters.specialization}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="location"
          placeholder="Search by location"
          value={searchFilters.location}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="availability"
          placeholder="Search by availability"
          value={searchFilters.availability}
          onChange={handleFilterChange}
        />
      </div>

      <div className="doctors-grid">
        {doctors.length === 0 ? (
          <div className="empty-state">
            <p>No doctors found</p>
          </div>
        ) : (
          doctors.map(doctor => (
            <div key={doctor.id} className="doctor-card">
              <div className="doctor-header">
                <h3>{doctor.name}</h3>
                <span className="gender-badge">{doctor.gender}</span>
              </div>
              
              <div className="doctor-details">
                <p><strong>Specialization:</strong> {doctor.specialization}</p>
                <p><strong>Location:</strong> {doctor.location}</p>
                <p><strong>Availability:</strong> {doctor.availability}</p>
                <p><strong>Added:</strong> {new Date(doctor.created_at).toLocaleDateString()}</p>
              </div>
              
              <div className="doctor-actions">
                <button 
                  onClick={() => handleEdit(doctor)}
                  className="edit-button"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(doctor.id)}
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
          setEditingDoctor(null)
          resetForm()
        }}
        title={editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
      >
        <form onSubmit={handleSubmit} className="doctor-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter doctor's name"
            />
          </div>

          <div className="form-group">
            <label>Specialization</label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              required
              placeholder="e.g., Cardiology, Neurology"
            />
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              placeholder="e.g., Building A, Room 101"
            />
          </div>

          <div className="form-group">
            <label>Availability</label>
            <input
              type="text"
              name="availability"
              value={formData.availability}
              onChange={handleInputChange}
              required
              placeholder="e.g., Mon-Fri 9:00-17:00"
            />
          </div>

          <div className="form-buttons">
            <button 
              type="button" 
              onClick={() => {
                setShowModal(false)
                setEditingDoctor(null)
                resetForm()
              }}
            >
              Cancel
            </button>
            <button type="submit" className="primary-button">
              {editingDoctor ? 'Update' : 'Add'} Doctor
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default DoctorManagement