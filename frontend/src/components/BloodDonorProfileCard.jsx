import React, { useState } from 'react';
import axios from 'axios';
import { 
  Heart, ShieldCheck, Clock, AlertTriangle, Phone, 
  MapPin, Edit3, Power, CheckCircle2, User, Droplet, FileText
} from 'lucide-react';

const BloodDonorProfileCard = ({ donor, onUpdateStatus, onOpenEdit }) => {
  const [toggling, setToggling] = useState(false);
  const [currentAvailable, setCurrentAvailable] = useState(donor?.isAvailable ?? true);

  if (!donor) return null;

  const toggleAvailability = async () => {
    setToggling(true);
    try {
      const newStatus = !currentAvailable;
      const res = await axios.put(`/api/blood-bank/donors/${donor._id}/availability`, {
        isAvailable: newStatus
      });
      setCurrentAvailable(newStatus);
      if (onUpdateStatus) onUpdateStatus(res.data.donor);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update availability status');
    } finally {
      setToggling(false);
    }
  };

  const getStatusBadge = () => {
    switch (donor.verificationStatus) {
      case 'verified':
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(16, 185, 129, 0.15)', color: '#34d399',
            border: '1px solid #10b981', padding: '0.25rem 0.75rem',
            borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700
          }}>
            <ShieldCheck size={14} /> Certified Blood Donor
          </span>
        );
      case 'rejected':
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(239, 68, 68, 0.15)', color: '#f87171',
            border: '1px solid #ef4444', padding: '0.25rem 0.75rem',
            borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700
          }}>
            <AlertTriangle size={14} /> Clinical Review Flagged
          </span>
        );
      default:
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24',
            border: '1px solid #f59e0b', padding: '0.25rem 0.75rem',
            borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700
          }}>
            <Clock size={14} /> Doctor Verification Pending
          </span>
        );
    }
  };

  return (
    <div className="glass-card" style={{
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
      borderRadius: '16px',
      padding: '1.5rem',
      position: 'relative'
    }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '1.4rem', fontWeight: 800,
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
          }}>
            {donor.bloodGroup}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#fff' }}>
                {donor.donorName}
              </h3>
              {getStatusBadge()}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Universal Health ID: <strong style={{ color: '#38bdf8' }}>{donor.patientHealthId}</strong> • {donor.gender}, {donor.age} yrs
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={toggleAvailability}
            disabled={toggling}
            className="btn btn-sm"
            style={{
              background: currentAvailable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
              color: currentAvailable ? '#34d399' : '#94a3b8',
              border: `1px solid ${currentAvailable ? '#10b981' : '#64748b'}`,
              fontWeight: 600
            }}
          >
            <Power size={13} /> {currentAvailable ? 'Available to Donate' : 'Paused'}
          </button>
          {onOpenEdit && (
            <button onClick={onOpenEdit} className="btn btn-secondary btn-sm" title="Edit Profile">
              <Edit3 size={13} /> Edit
            </button>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid-3" style={{ gap: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ fontSize: '0.82rem' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Location / City</span>
          <strong style={{ color: '#cbd5e1' }}><MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{donor.city}, {donor.state || 'India'}</strong>
        </div>
        <div style={{ fontSize: '0.82rem' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Emergency Contact</span>
          <strong style={{ color: '#38bdf8' }}><Phone size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{donor.phone}</strong>
        </div>
        <div style={{ fontSize: '0.82rem' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Last Donation</span>
          <strong style={{ color: '#cbd5e1' }}>
            {donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : 'First Time Donor'}
          </strong>
        </div>
      </div>

      {/* Doctor Review Note */}
      {donor.doctorNotes && (
        <div style={{
          marginTop: '0.85rem', padding: '0.65rem 0.9rem',
          background: donor.verificationStatus === 'verified' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
          borderRadius: '10px', borderLeft: `3px solid ${donor.verificationStatus === 'verified' ? '#10b981' : '#f59e0b'}`,
          fontSize: '0.78rem', color: '#cbd5e1'
        }}>
          <strong>Doctor Clinical Audit: </strong>
          {donor.doctorNotes}
          {donor.verifiedByName && (
            <span style={{ display: 'block', marginTop: '0.2rem', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
              Reviewed by: Dr. {donor.verifiedByName} on {new Date(donor.verifiedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BloodDonorProfileCard;
