
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth methods
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Doctor methods
  async getDoctors(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/doctors${queryParams ? `?${queryParams}` : ''}`);
  }

  async createDoctor(doctorData) {
    return this.request('/doctors', {
      method: 'POST',
      body: JSON.stringify(doctorData),
    });
  }

  async updateDoctor(id, doctorData) {
    return this.request(`/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(doctorData),
    });
  }

  async deleteDoctor(id) {
    return this.request(`/doctors/${id}`, {
      method: 'DELETE',
    });
  }

  // Appointment methods
  async getAppointments() {
    return this.request('/appointments');
  }

  async createAppointment(appointmentData) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async updateAppointment(id, appointmentData) {
    return this.request(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData),
    });
  }

  async deleteAppointment(id) {
    return this.request(`/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  // Patient methods
  async getPatients() {
    return this.request('/patients');
  }

  async createPatient(patientData) {
    return this.request('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  }

  // Queue methods
  async getQueue() {
    return this.request('/queue');
  }

  async addToQueue(queueData) {
    return this.request('/queue', {
      method: 'POST',
      body: JSON.stringify(queueData),
    });
  }

  async updateQueueStatus(id, status) {
    return this.request(`/queue/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
}

export const apiService = new ApiService();

export const authService = {
  login: (credentials) => apiService.login(credentials),
  register: (userData) => apiService.register(userData),
};


class ApiService {
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (this.token) {
      config.headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw {
          response: {
            status: response.status,
            data: data
          }
        };
      }

      return data;
    } catch (error) {
      if (error.response) {
        throw error;
      }

      throw {
        response: {
          status: 500,
          data: { message: 'Network error' }
        }
      };
    }
  }

  // Authentication
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // Doctors
  async getDoctors(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/doctors${params ? `?${params}` : ''}`);
  }

  async createDoctor(doctorData) {
    return this.request('/doctors', {
      method: 'POST',
      body: JSON.stringify(doctorData)
    });
  }

  async updateDoctor(id, doctorData) {
    return this.request(`/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(doctorData)
    });
  }

  async deleteDoctor(id) {
    return this.request(`/doctors/${id}`, {
      method: 'DELETE'
    });
  }

  // Patients
  async getPatients() {
    return this.request('/patients');
  }

  async createPatient(patientData) {
    return this.request('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData)
    });
  }

  // Appointments
  async getAppointments(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/appointments${params ? `?${params}` : ''}`);
  }

  async createAppointment(appointmentData) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });
  }

  async updateAppointment(id, appointmentData) {
    return this.request(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData)
    });
  }

  async deleteAppointment(id) {
    return this.request(`/appointments/${id}`, {
      method: 'DELETE'
    });
  }

  // Queue
  async getQueue() {
    return this.request('/queue');
  }

  async addToQueue(queueData) {
    return this.request('/queue', {
      method: 'POST',
      body: JSON.stringify(queueData)
    });
  }

  async updateQueue(id, updateData) {
    return this.request(`/queue/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });
  }

  async removeFromQueue(id) {
    return this.request(`/queue/${id}`, {
      method: 'DELETE'
    });
  }
}

export const authService = new ApiService();
export const apiService = new ApiService();

// Keep token synced between both services
const originalSetToken = authService.setToken.bind(authService);
authService.setToken = (token) => {
  originalSetToken(token);
  apiService.setToken(token);
};
