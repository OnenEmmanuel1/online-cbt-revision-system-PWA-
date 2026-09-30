import React from 'react';
import useAuth from '../hooks/useAuth';
import { User, Bell, Shield, Moon } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Pengaturan (Settings)</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Profile Card */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--cbtr-border)', paddingBottom: '1rem' }}>
            <User size={20} color="var(--cbtr-primary)" /> Profil Pengguna
          </h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--cbtr-text-secondary)', margin: '0 0 0.25rem 0' }}>Nama Lengkap</p>
            <p style={{ margin: 0, fontWeight: '500', fontSize: '1.1rem' }}>{user?.fullName || 'Pengguna'}</p>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--cbtr-text-secondary)', margin: '0 0 0.25rem 0' }}>Email</p>
            <p style={{ margin: 0, fontWeight: '500', fontSize: '1.1rem' }}>{user?.email || 'email@example.com'}</p>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--cbtr-text-secondary)', margin: '0 0 0.25rem 0' }}>Peran (Role)</p>
            <p style={{ margin: 0, fontWeight: '500', fontSize: '1.1rem', color: 'var(--cbtr-primary)' }}>{user?.role || 'Siswa'}</p>
          </div>
          
          <button className="cbtr-btn cbtr-btn-primary" style={{ width: '100%', marginTop: '1rem', borderRadius: '8px' }}>
            Edit Profil
          </button>
        </div>

        {/* Preferences Card */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--cbtr-border)', paddingBottom: '1rem' }}>
            <Shield size={20} color="var(--cbtr-primary)" /> Preferensi Aplikasi
          </h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.5rem', backgroundColor: 'var(--cbtr-bg)', borderRadius: '8px' }}>
                <Bell size={20} color="var(--cbtr-text-secondary)" />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: '500' }}>Notifikasi Email</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--cbtr-text-secondary)' }}>Terima update hasil tes</p>
              </div>
            </div>
            <div style={{ width: '40px', height: '24px', backgroundColor: 'var(--cbtr-primary)', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
              <div style={{ width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '3px', right: '3px' }}></div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.5rem', backgroundColor: 'var(--cbtr-bg)', borderRadius: '8px' }}>
                <Moon size={20} color="var(--cbtr-text-secondary)" />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: '500' }}>Mode Gelap</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--cbtr-text-secondary)' }}>Tema gelap untuk aplikasi</p>
              </div>
            </div>
            <div style={{ width: '40px', height: '24px', backgroundColor: 'var(--cbtr-border)', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
              <div style={{ width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: '3px' }}></div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Settings;
