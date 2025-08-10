# Clinic Front Desk System

A comprehensive full-stack application for managing front desk operations in a medical clinic.

## Tech Stack

- **Frontend**: React (Vite) with plain CSS
- **Backend**: Node.js + Express
- **Database**: SQLite with better-sqlite3
- **Authentication**: JWT + bcrypt
- **Development**: ESLint, Prettier, npm scripts

## Features

- 🔐 **Authentication**: Secure login for front desk staff
- 👨‍⚕️ **Doctor Management**: Add, edit, and manage doctor profiles
- 📅 **Appointment Booking**: Schedule and manage patient appointments
- 🏥 **Queue Management**: Real-time queue system with priority handling
- 🔍 **Search & Filter**: Find doctors by specialization, location, and availability
- 📱 **Responsive Design**: Works on desktop and tablet devices

## Quick Start

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Environment Setup
Copy the example environment file in the backend directory:
```bash
cd backend
cp .env.example .env
```

### 3. Initialize Database
```bash
npm run seed
```

### 4. Start Development Servers
```bash
npm run dev
```

This will start both the backend server (http://localhost:5000) and frontend development server (http://localhost:5173).

## Demo Credentials

- **Admin**: admin@clinic.com / admin123
- **Front Desk**: frontdesk@clinic.com / frontdesk123

## Project Structure

```
clinic-front-desk-system/
├── backend/                 # Express API server
│   ├── routes/             # API route handlers
│   ├── middleware/         # Auth & validation middleware
│   ├── models/             # Database models
│   ├── scripts/            # Database seeding
│   └── data/               # SQLite database file
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API service calls
│   │   ├── context/        # React context providers
│   │   └── styles/         # CSS stylesheets
│   └── public/             # Static assets
└── package.json            # Root package.json for scripts
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new staff member
- `POST /api/auth/login` - Login with credentials

### Doctors
- `GET /api/doctors` - Get all doctors
- `POST /api/doctors` - Add new doctor
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor

### Appointments
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Book appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Queue Management
- `GET /api/queue` - Get current queue
- `POST /api/queue` - Add patient to queue
- `PATCH /api/queue/:id` - Update queue status

## Development Scripts

### Backend
- `npm run dev` - Start with nodemon
- `npm start` - Production start
- `npm run seed` - Reset and seed database

### Frontend
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview production build

## Database Schema

### Users
- ID, name, email (unique), password hash, role, created timestamp

### Doctors
- ID, name, specialization, gender, location, availability, created timestamp

### Patients
- ID, name, phone, email, created timestamp

### Appointments
- ID, patient ID, doctor ID, appointment time, status, created timestamp

### Queue
- ID, patient ID, queue number, priority, status, created timestamp

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details# appointments
