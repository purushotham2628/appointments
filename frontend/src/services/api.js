const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token')
    console.log('API Base URL:', API_BASE_URL)
  }

  setToken(token) {
    this.token = token
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    console.log('Making request to:', url)

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers
      },
      ...options
    }

    try {
      const response = await fetch(url, config)
      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', errorData)
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('API Response:', data)
      return data
    } catch (error) {
      console.error('Network error:', error)
      throw error
    }
  }

  // Authentication
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  async getProfile() {
    return this.request('/auth/profile')
  }

  // Doctors
  async getDoctors(filters = {}) {
    const params = new URLSearchParams(filters).toString()
    return this.request(`/doctors${params ? `?${params}` : ''}`)
  }

  async createDoctor(doctorData) {
    return this.request('/doctors', {
      method: 'POST',
      body: JSON.stringify(doctorData)
    })
  }

  async updateDoctor(id, doctorData) {
    return this.request(`/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(doctorData)
    })
  }

  async deleteDoctor(id) {
    return this.request(`/doctors/${id}`, {
      method: 'DELETE'
    })
  }

  // Patients
  async getPatients() {
    return this.request('/patients')
  }

  async createPatient(patientData) {
    return this.request('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData)
    })
  }

  // Appointments
  async getAppointments(filters = {}) {
    const params = new URLSearchParams(filters).toString()
    return this.request(`/appointments${params ? `?${params}` : ''}`)
  }

  async createAppointment(appointmentData) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    })
  }

  async updateAppointment(id, appointmentData) {
    return this.request(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData)
    })
  }

  async deleteAppointment(id) {
    return this.request(`/appointments/${id}`, {
      method: 'DELETE'
    })
  }

  // Queue
  async getQueue() {
    return this.request('/queue')
  }

  async addToQueue(queueData) {
    return this.request('/queue', {
      method: 'POST',
      body: JSON.stringify(queueData)
    })
  }

  async updateQueue(id, updateData) {
    return this.request(`/queue/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    })
  }

  async removeFromQueue(id) {
    return this.request(`/queue/${id}`, {
      method: 'DELETE'
    })
  }
}

export const apiService = new ApiService()
export const authService = new ApiService()