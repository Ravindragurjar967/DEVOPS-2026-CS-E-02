import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Activity, LogOut, User as UserIcon, Shield, Stethoscope, Pill } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'doctor':
        return <span className="badge badge-doctor"><Stethoscope size={13} /> Doctor</span>;
      case 'pharmacist':
        return <span className="badge badge-pharmacist"><Pill size={13} /> Pharmacy Staff</span>;
      case 'patient':
        return <span className="badge badge-patient"><UserIcon size={13} /> Patient</span>;
      default:
        return <span className="badge badge-doctor"><Shield size={13} /> {role}</span>;
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand-logo">
        <Activity size={28} className="text-primary" />
        <span>MediLink <span style={{ fontSize: '0.8rem', opacity: 0.8, color: '#38bdf8' }}>E-RX</span></span>
      </Link>

      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {getRoleBadge(user.role)}
          {user.healthId && (
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '0.35rem 0.75rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
              Health ID: <strong style={{ color: '#38bdf8' }}>{user.healthId}</strong>
            </span>
          )}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '600', fontSize: '0.92rem' }}>{user.name}</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{user.email}</div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Logout">
            <LogOut size={16} /> Logout
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Universal Health ID</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
