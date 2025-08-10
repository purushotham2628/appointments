
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import DoctorManagement from './DoctorManagement'
import AppointmentManagement from './AppointmentManagement'
import QueueManagement from './QueueManagement'
import PatientManagement from './PatientManagement'
import '../styles/Dashboard.css'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('appointments')

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Clinic Front Desk System</h1>
            <p>Welcome back, {user?.name}</p>
          </div>
          <div className="header-right">
            <span className="user-role">{user?.role}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button 
          className={`nav-button ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          📅 Appointments
        </button>
        <button 
          className={`nav-button ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          👥 Queue
        </button>
        <button 
          className={`nav-button ${activeTab === 'doctors' ? 'active' : ''}`}
          onClick={() => setActiveTab('doctors')}
        >
          👨‍⚕️ Doctors
        </button>
        <button 
          className={`nav-button ${activeTab === 'patients' ? 'active' : ''}`}
          onClick={() => setActiveTab('patients')}
        >
          👤 Patients
        </button>
      </nav>

      <main className="dashboard-main">
        {activeTab === 'appointments' && <AppointmentManagement />}
        {activeTab === 'queue' && <QueueManagement />}
        {activeTab === 'doctors' && <DoctorManagement />}
        {activeTab === 'patients' && <PatientManagement />}
      </main>
    </div>
  )
}

export default Dashboard
