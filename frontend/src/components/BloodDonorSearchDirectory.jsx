import React, { useState } from 'react';
import { 
  Search, Droplet, Phone, MessageSquare, MapPin, 
  ShieldCheck, Check, Copy, User, Calendar, Filter, HeartHandshake, AlertCircle
} from 'lucide-react';

const BLOOD_GROUPS = ['ALL', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const BloodDonorSearchDirectory = ({ donors, loading, onRequestBloodClick }) => {
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyPhone = (phone, id) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCleanPhone = (phone) => {
    return phone.replace(/[^0-9]/g, '');
  };

  const filteredDonors = donors.filter(d => {
    if (selectedGroup !== 'ALL' && d.bloodGroup !== selectedGroup) return false;
    if (cityFilter && !d.city.toLowerCase().includes(cityFilter.toLowerCase())) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      const matchName = d.donorName.toLowerCase().includes(s);
      const matchCity = d.city.toLowerCase().includes(s);
      const matchHealthId = d.patientHealthId && d.patientHealthId.toLowerCase().includes(s);
      if (!matchName && !matchCity && !matchHealthId) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Filter & Search Controls */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HeartHandshake size={20} style={{ color: '#ef4444' }} /> Certified Blood Donors Directory
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
              All donors listed below are verified by certified doctors with clinical safety checks.
            </p>
          </div>

          {onRequestBloodClick && (
            <button
              onClick={onRequestBloodClick}
              className="btn"
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: '#fff',
                fontWeight: 700,
                border: 'none',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
              }}
            >
              <Droplet size={16} /> Need Blood Urgently? Post Request
            </button>
          )}
        </div>

        {/* Quick Blood Group Chips */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
            FILTER BY BLOOD GROUP:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {BLOOD_GROUPS.map((bg) => (
              <button
                key={bg}
                onClick={() => setSelectedGroup(bg)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: selectedGroup === bg ? '#ef4444' : 'rgba(30, 41, 59, 0.7)',
                  color: selectedGroup === bg ? '#fff' : '#cbd5e1',
                  border: selectedGroup === bg ? '1px solid #f87171' : '1px solid rgba(255,255,255,0.08)'
                }}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Search Inputs */}
        <div className="grid-2" style={{ gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '2.4rem' }}
              placeholder="Search donor name or Health ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '2.4rem' }}
              placeholder="Filter by City (e.g. Jaipur, Delhi)..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Donors List Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Droplet size={36} className="text-danger" style={{ animation: 'bounce 1s infinite', marginBottom: '0.75rem' }} />
          <p>Loading certified blood donors...</p>
        </div>
      ) : filteredDonors.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
          <AlertCircle size={44} style={{ color: '#f59e0b', marginBottom: '0.75rem' }} />
          <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.3rem' }}>No Matching Blood Donors Found</h4>
          <p style={{ fontSize: '0.85rem', maxWidth: '480px', margin: '0 auto 1.25rem' }}>
            No verified donors found for group "{selectedGroup}" in this city right now. You can post an emergency request with your prescription so nearby donors are alerted!
          </p>
          {onRequestBloodClick && (
            <button onClick={onRequestBloodClick} className="btn btn-primary btn-sm">
              <Droplet size={14} /> Post Emergency Requisition
            </button>
          )}
        </div>
      ) : (
        <div className="grid-3" style={{ gap: '1.25rem' }}>
          {filteredDonors.map((donor) => {
            const cleanPhone = getCleanPhone(donor.phone);
            const waMessage = encodeURIComponent(
              `Hello ${donor.donorName}, I found your verified profile on MediLink Blood Bank. We urgently need ${donor.bloodGroup} blood in ${donor.city}. Can you please assist?`
            );

            return (
              <div
                key={donor._id}
                className="glass-card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  background: 'rgba(15, 23, 42, 0.75)',
                  borderRadius: '16px',
                  transition: 'transform 0.2s, border-color 0.2s'
                }}
              >
                <div>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '12px',
                      background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                      color: '#fff', fontSize: '1.25rem', fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)'
                    }}>
                      {donor.bloodGroup}
                    </div>

                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                      background: 'rgba(16, 185, 129, 0.15)', color: '#34d399',
                      border: '1px solid #10b981', padding: '0.2rem 0.6rem',
                      borderRadius: '16px', fontSize: '0.72rem', fontWeight: 700
                    }}>
                      <ShieldCheck size={12} /> Certified
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: '0 0 0.2rem' }}>
                    {donor.donorName}
                  </h4>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {donor.gender}, {donor.age} yrs • <MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {donor.city}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '0.4rem' }}>
                    Health ID: <strong>{donor.patientHealthId}</strong>
                  </div>

                  {donor.verifiedByName && (
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.6rem', borderRadius: '8px' }}>
                      Certified by: <strong>Dr. {donor.verifiedByName}</strong>
                    </div>
                  )}
                </div>

                {/* Direct Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {/* Call Button */}
                    <a
                      href={`tel:${donor.phone}`}
                      className="btn btn-sm"
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: '#fff',
                        fontWeight: 700,
                        textAlign: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Phone size={13} /> Call Now
                    </a>

                    {/* WhatsApp Button */}
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${waMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm"
                      style={{
                        flex: 1,
                        background: '#25D366',
                        color: '#fff',
                        fontWeight: 700,
                        textAlign: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <MessageSquare size={13} /> WhatsApp
                    </a>
                  </div>

                  {/* Copy Number */}
                  <button
                    onClick={() => handleCopyPhone(donor.phone, donor._id)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', justifyContent: 'center' }}
                  >
                    {copiedId === donor._id ? (
                      <>
                        <Check size={13} style={{ color: '#10b981' }} /> Copied {donor.phone}!
                      </>
                    ) : (
                      <>
                        <Copy size={13} /> Copy Contact: {donor.phone}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BloodDonorSearchDirectory;
