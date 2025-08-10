import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import QueueManagement from './QueueManagement'
import AppointmentManagement from './AppointmentManagement'
import DoctorManagement from './DoctorManagement'
import PatientManagement from './PatientManagement'
import '../styles/Dashboard.css'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('queue')
  const { user, logout } = useAuth()

  const tabs = [
    { id: 'queue', label: 'Queue', icon: '🏥' },
    { id: 'appointments', label: 'Appointments', icon: '📅' },
    { id: 'doctors', label: 'Doctors', icon: '👨‍⚕️' },
    { id: 'patients', label: 'Patients', icon: '👥' }
  ]

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'queue':
        return <QueueManagement />
      case 'appointments':
        return <AppointmentManagement />
      case 'doctors':
        return <DoctorManagement />
      case 'patients':
        return <PatientManagement />
      default:
        return <QueueManagement />
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Clinic Front Desk System</h1>
          <div className="user-info">
            <span>Welcome, {user?.name}</span>
            <span className="user-role">{user?.role}</span>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <nav className="dashboard-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <main className="dashboard-main">
          {renderActiveComponent()}
        </main>
      </div>
    </div>
  )
}

export default Dashboard