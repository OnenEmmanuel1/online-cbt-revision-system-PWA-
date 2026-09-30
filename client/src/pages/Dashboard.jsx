import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import { CheckCircle, BookOpen, Target, Heart, ClipboardList, Eye } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/student/analytics');
        setAnalytics(res.data);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  const topicStats = analytics?.topicStats || [];
  const history = analytics?.history || [];

  // Compute metrics
  const masteredTopics = topicStats.filter(t => (t.correctCount / t.totalAttempts) >= 0.8).length;
  
  // Sort topics by weakest accuracy for recommendations
  const recommendedTopics = [...topicStats]
    .filter(t => t.totalAttempts > 0)
    .sort((a, b) => (a.correctCount / a.totalAttempts) - (b.correctCount / b.totalAttempts))
    .slice(0, 3);

  return (
    <div>
      <h2 style={{ color: 'var(--cbtr-text-primary)', marginBottom: '2rem', fontSize: '1.5rem' }}>
        Selamat Datang, {user?.fullName?.split(' ')[0]}!
      </h2>

      {/* Stat Cards */}
      <div className="cbtr-stat-grid">
        <div className="cbtr-stat-card">
          <div className="cbtr-stat-icon green">
            <CheckCircle size={24} />
          </div>
          <div className="cbtr-stat-info">
            <h3>Total Points</h3>
            <p>{analytics?.points || 0} <span>pts</span></p>
          </div>
        </div>

        <div className="cbtr-stat-card">
          <div className="cbtr-stat-icon amber">
            <BookOpen size={24} />
          </div>
          <div className="cbtr-stat-info">
            <h3>Tests Completed</h3>
            <p>{analytics?.totalTests || 0} <span>tests</span></p>
          </div>
        </div>

        <div className="cbtr-stat-card">
          <div className="cbtr-stat-icon red">
            <Target size={24} />
          </div>
          <div className="cbtr-stat-info">
            <h3>Topics Mastered</h3>
            <p>{masteredTopics} <span>topics</span></p>
          </div>
        </div>
      </div>

      {/* Recommended for Revision */}
      {recommendedTopics.length > 0 && (
        <>
          <h3 className="cbtr-section-title">Mock Tests (Recommended)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {recommendedTopics.map(topic => {
              const accuracy = Math.round((topic.correctCount / topic.totalAttempts) * 100);
              return (
                <div key={topic.topicId} className="cbtr-course-card">
                  <div className="cbtr-card-header">
                    <div style={{ width: '60%' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--cbtr-text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>{accuracy}% Accuracy</div>
                      <div className="cbtr-progress-track">
                        <div className="cbtr-progress-fill" style={{ width: `${accuracy}%` }}></div>
                      </div>
                    </div>
                    <div className="cbtr-card-header-icon">
                      <Heart size={16} fill="currentColor" />
                    </div>
                  </div>
                  
                  <div className="cbtr-card-main-icon">
                    <ClipboardList size={32} />
                  </div>
                  
                  <h4>{topic.topicName}</h4>
                  
                  <button className="cbtr-card-btn" onClick={() => navigate('/test/setup')}>
                    Take Test
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Recent Test Sessions */}
      <h3 className="cbtr-section-title">Recent Practice Questions</h3>
      {history.length === 0 ? (
        <div className="cbtr-course-card" style={{ padding: '3rem 1rem' }}>
          <p style={{ color: 'var(--cbtr-text-secondary)', marginBottom: '1rem' }}>You haven't taken any tests yet.</p>
          <button className="cbtr-card-btn" onClick={() => navigate('/browse')}>
            Browse Courses
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {history.map(session => (
            <div key={session.sessionId} className="cbtr-course-card">
              <div className="cbtr-card-header">
                <div style={{ width: '60%' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--cbtr-text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>Score: {session.score}</div>
                  <div className="cbtr-progress-track">
                    <div className="cbtr-progress-fill" style={{ width: `100%`, backgroundColor: 'var(--cbtr-success)' }}></div>
                  </div>
                </div>
                <div className="cbtr-card-header-icon" style={{ backgroundColor: 'var(--cbtr-badge-purple)', color: 'var(--cbtr-primary)' }}>
                  <CheckCircle size={16} />
                </div>
              </div>
              
              <div className="cbtr-card-main-icon" style={{ backgroundColor: 'var(--cbtr-navy)' }}>
                <ClipboardList size={32} />
              </div>
              
              <h4 style={{ marginBottom: '0.5rem' }}>{session.courseTitle}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--cbtr-text-secondary)', textAlign: 'center', marginBottom: '1.5rem', marginTop: 0 }}>
                {new Date(session.submittedAt).toLocaleDateString()}
              </p>
              
              <button className="cbtr-card-btn" onClick={() => navigate(`/results/${session.sessionId}`)}>
                View Results
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
