import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Hash, Clock, Wifi, PlayCircle } from 'lucide-react';
import api from '../services/api';
import { getOfflineCourse } from '../services/offlineDB';

const TestSetup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [questionCount, setQuestionCount] = useState(10);
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [mode, setMode] = useState('online');

  const { courseId, topicId } = location.state || {};

  if (!courseId) {
    return <div className="container">Invalid setup. Please select a course from Browse.</div>;
  }

  const handleStart = async () => {
    if (mode === 'offline') {
      const offlineData = await getOfflineCourse(courseId);
      if (!offlineData) {
        alert('Course is not downloaded for offline. Please download it first.');
        return;
      }
      // Generate a mock session for offline
      let pool = topicId ? offlineData.questions.filter(q => q.topicId === topicId) : offlineData.questions;
      // Shuffle and slice
      pool = pool.sort(() => 0.5 - Math.random()).slice(0, questionCount);
      
      const offlineSession = {
        isOffline: true,
        localId: Date.now(), // temporary ID
        courseId,
        topicId,
        durationSeconds: durationMinutes * 60,
        questions: pool,
        startedAt: new Date().toISOString()
      };
      
      localStorage.setItem('current_offline_session', JSON.stringify(offlineSession));
      navigate('/test/session', { state: { sessionId: 'offline' } });

    } else {
      try {
        const res = await api.post('/student/sessions/start', {
          courseId,
          topicId,
          questionCount,
          durationSeconds: durationMinutes * 60
        });
        navigate('/test/session', { state: { sessionId: res.data.sessionId, sessionData: res.data } });
      } catch (err) {
        alert('Failed to start session online.');
      }
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '2rem' }}>
      <div className="cbtr-course-card" style={{ padding: '2.5rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--cbtr-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlayCircle size={28} color="var(--cbtr-primary)" /> Setup Test
        </h2>
        
        <div style={{ marginBottom: '1.5rem', width: '100%' }}>
          <label className="cbtr-form-label">Number of Questions</label>
          <div className="cbtr-input-wrapper">
            <Hash className="cbtr-input-icon" size={20} />
            <input 
              type="number" 
              value={questionCount} 
              onChange={(e) => setQuestionCount(e.target.value)} 
              min="1" max="50" 
              style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem', width: '100%' }}>
          <label className="cbtr-form-label">Time Limit (Minutes)</label>
          <div className="cbtr-input-wrapper">
            <Clock className="cbtr-input-icon" size={20} />
            <input 
              type="number" 
              value={durationMinutes} 
              onChange={(e) => setDurationMinutes(e.target.value)} 
              min="1" max="120" 
              style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '2rem', width: '100%' }}>
          <label className="cbtr-form-label">Mode</label>
          <div className="cbtr-input-wrapper">
            <Wifi className="cbtr-input-icon" size={20} />
            <select 
              value={mode} 
              onChange={(e) => setMode(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent' }}
            >
              <option value="online">Online (Realtime tracking)</option>
              <option value="offline">Offline (Requires course download)</option>
            </select>
          </div>
        </div>

        <button className="cbtr-btn cbtr-btn-primary" style={{ width: '100%', fontSize: '1.1rem', padding: '1rem', borderRadius: '30px' }} onClick={handleStart}>
          Begin Assessment
        </button>
      </div>
    </div>
  );
};

export default TestSetup;
