import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';
import Register from './pages/Register';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';
import AdminDashboard from './pages/AdminDashboard';
import WritePrescription from './pages/WritePrescription';
import PrescriptionView from './pages/PrescriptionView';
import UniversalPatientRecord from './pages/UniversalPatientRecord';
import PatientRecords from './pages/PatientRecords';
import MyReports from './pages/MyReports';
import BookAppointment from './pages/BookAppointment';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Authenticating session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const DashboardRouter = () => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'admin') return <AdminDashboard />;
  if (user.role === 'doctor') return <DoctorDashboard />;
  if (user.role === 'patient') return <PatientDashboard />;
  if (user.role === 'pharmacist') return <PharmacistDashboard />;
  return <DoctorDashboard />;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-layout">
        {user && <Sidebar />}
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/write-prescription" element={
              <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                <WritePrescription />
              </ProtectedRoute>
            } />

            <Route path="/book-appointment" element={
              <ProtectedRoute allowedRoles={['patient', 'admin']}>
                <BookAppointment />
              </ProtectedRoute>
            } />

            <Route path="/prescription/:id" element={
              <ProtectedRoute>
                <PrescriptionView />
              </ProtectedRoute>
            } />

            <Route path="/patient-record/:healthId" element={
              <ProtectedRoute>
                <UniversalPatientRecord />
              </ProtectedRoute>
            } />

            <Route path="/search-patients" element={
              <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                <PatientRecords />
              </ProtectedRoute>
            } />

            <Route path="/my-prescriptions" element={
              <ProtectedRoute allowedRoles={['patient', 'admin']}>
                <PatientDashboard />
              </ProtectedRoute>
            } />

            <Route path="/my-reports" element={
              <ProtectedRoute>
                <MyReports />
              </ProtectedRoute>
            } />

            <Route path="/pharmacist-verify" element={
              <ProtectedRoute allowedRoles={['pharmacist', 'admin']}>
                <PharmacistDashboard />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
