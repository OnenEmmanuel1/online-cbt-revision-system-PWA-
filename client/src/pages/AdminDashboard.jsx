import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, FileQuestion, BookOpen, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/analytics');
      setStats(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadStatus('Uploading...');
      const res = await api.post('/admin/questions/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadStatus(`Success! Processed ${res.data.processed} rows. ${res.data.errors.length} errors.`);
      setFile(null);
      fetchStats(); // refresh counts
    } catch (error) {
      setUploadStatus('Upload failed.');
      console.error(error);
    }
  };

  if (loading) return <div className="container">Loading dashboard...</div>;

  return (
    <div>
      <h2>Admin Dashboard</h2>
      
      <div className="cbtr-stat-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="cbtr-stat-card">
          <div className="cbtr-stat-icon" style={{ backgroundColor: 'var(--cbtr-badge-purple)', color: 'var(--cbtr-primary)' }}>
            <Users size={24} />
          </div>
          <div className="cbtr-stat-info">
            <h3>Total Students</h3>
            <p>{stats.systemStats.totalStudents}</p>
          </div>
        </div>
        
        <div className="cbtr-stat-card">
          <div className="cbtr-stat-icon amber">
            <FileQuestion size={24} />
          </div>
          <div className="cbtr-stat-info">
            <h3>Total Questions</h3>
            <p>{stats.systemStats.totalQuestions}</p>
          </div>
        </div>
        
        <div className="cbtr-stat-card">
          <div className="cbtr-stat-icon green">
            <BookOpen size={24} />
          </div>
          <div className="cbtr-stat-info">
            <h3>Sessions Completed</h3>
            <p>{stats.systemStats.totalSessionsCompleted}</p>
          </div>
        </div>
      </div>

      <div className="grid">


        <div className="cbtr-course-card" style={{ alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--cbtr-badge-red)', color: 'var(--cbtr-danger)', borderRadius: '50%' }}>
              <AlertCircle size={20} />
            </div>
            <h3 style={{ margin: 0 }}>Needs Improvement (Hardest Questions)</h3>
          </div>
          <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.9rem', width: '100%' }}>
            {stats.hardestQuestions.length > 0 ? stats.hardestQuestions.map((q, idx) => (
              <li key={idx} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--cbtr-border)' }}>
                <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>{q.text}</div>
                <span style={{ color: 'var(--cbtr-danger)', fontWeight: 'bold', backgroundColor: 'var(--cbtr-badge-red)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.8rem' }}>
                  {Math.round((q.correctCount / q.totalAttempts) * 100)}% correct
                </span>
                <span style={{ color: 'var(--cbtr-text-secondary)', marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                  ({q.totalAttempts} attempts)
                </span>
              </li>
            )) : <p>Not enough data yet.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
