import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, FilePlus, FileText, Search, Pill, Activity, User, ShieldCheck } from 'lucide-react';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <aside className="sidebar">
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', padding: '0.5rem 1rem' }}>
        Portal Navigation
      </div>

      <NavLink to="/" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={18} />
        <span>Dashboard</span>
      </NavLink>

      {user.role === 'doctor' && (
        <>
          <NavLink to="/write-prescription" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <FilePlus size={18} />
            <span>Write Prescription</span>
          </NavLink>
          <NavLink to="/search-patients" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <Search size={18} />
            <span>Patient Records</span>
          </NavLink>
        </>
      )}

      {user.role === 'patient' && (
        <>
          <NavLink to="/my-prescriptions" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <FileText size={18} />
            <span>My Prescriptions</span>
          </NavLink>
          <NavLink to="/my-reports" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <Activity size={18} />
            <span>Lab & Medical Reports</span>
          </NavLink>
        </>
      )}

      {user.role === 'pharmacist' && (
        <>
          <NavLink to="/pharmacist-verify" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <Pill size={18} />
            <span>Verify & Dispense</span>
          </NavLink>
        </>
      )}

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <div className="glass-card" style={{ padding: '1rem', background: 'rgba(14, 165, 233, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 600, fontSize: '0.85rem' }}>
            <ShieldCheck size={16} /> 100% Paperless RX
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>
            Universal digital verification system connected via QR & Health ID.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
