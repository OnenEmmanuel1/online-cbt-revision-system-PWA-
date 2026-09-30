import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { saveOfflineSession } from '../services/offlineDB';
import useAuth from '../hooks/useAuth';

const TestSession = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateUserPoints } = useAuth();
  
  const { sessionId, sessionData } = location.state || {};
  const isOffline = sessionId === 'offline';
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    if (isOffline) {
      const stored = localStorage.getItem('current_offline_session');
      if (stored) {
        const data = JSON.parse(stored);
        setQuestions(data.questions);
        setTimeLeft(data.durationSeconds);
      } else {
        navigate('/browse');
      }
    } else {
      if (sessionData) {
        setQuestions(sessionData.questions);
        setTimeLeft(sessionData.durationSeconds);
      }
    }
  }, [isOffline, sessionData, navigate]);

  useEffect(() => {
    if (timeLeft > 0 && !submitting) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timeLeft, submitting]);

  const handleSelectOption = async (optionId) => {
    const questionId = questions[currentIndex].questionId;
    setAnswers({ ...answers, [questionId]: optionId });

    if (!isOffline) {
      try {
        await api.post(`/student/sessions/${sessionId}/answers`, {
          questionId,
          selectedOptionId: optionId
        });
      } catch (error) {
        console.error('Failed to save answer online', error);
      }
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);

    if (isOffline) {
      const stored = JSON.parse(localStorage.getItem('current_offline_session'));
      const formattedAnswers = Object.keys(answers).map(qId => ({
        questionId: parseInt(qId),
        selectedOptionId: answers[qId],
        answeredAt: new Date().toISOString()
      }));

      const finalSession = {
        ...stored,
        submittedAt: new Date().toISOString(),
        answers: formattedAnswers,
        userId: user.userId
      };

      await saveOfflineSession(finalSession);
      localStorage.removeItem('current_offline_session');
      alert('Test completed offline. Results will be synced and graded when you reconnect.');
      navigate('/dashboard');
    } else {
      try {
        const res = await api.post(`/student/sessions/${sessionId}/submit`);
        if (res.data.points > 0) {
          updateUserPoints(res.data.points);
        }
        navigate(`/results/${sessionId}`);
      } catch (error) {
        console.error('Submit failed', error);
        alert('Submission failed. Your test might have expired.');
        navigate('/dashboard');
      }
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (questions.length === 0) return <div className="container">Loading test...</div>;

  const currentQ = questions[currentIndex];

  return (
    <div className="container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
      <div className="flex-between" style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--cbtr-surface)', borderRadius: 'var(--cbtr-radius)', boxShadow: 'var(--cbtr-shadow)' }}>
        <h3 style={{ margin: 0 }}>
          Question {currentIndex + 1} of {questions.length}
        </h3>
        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: timeLeft < 60 ? 'var(--cbtr-danger)' : 'var(--cbtr-primary)' }}>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem', lineHeight: '1.6' }}>
          {currentQ.text}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {currentQ.options.map(opt => (
            <button
              key={opt.optionId}
              className="btn"
              style={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                padding: '1.2rem',
                border: '2px solid',
                borderColor: answers[currentQ.questionId] === opt.optionId ? 'var(--cbtr-primary)' : 'var(--cbtr-border)',
                backgroundColor: answers[currentQ.questionId] === opt.optionId ? 'var(--cbtr-badge-purple)' : 'white',
                color: 'var(--cbtr-text-primary)',
                borderRadius: '12px',
                transition: 'all 0.2s'
              }}
              onClick={() => handleSelectOption(opt.optionId)}
            >
              {opt.optionText}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-between" style={{ marginTop: '2rem' }}>
        <button 
          className="cbtr-btn" 
          style={{ backgroundColor: 'white', border: '1px solid var(--cbtr-border)', color: 'var(--cbtr-text-primary)', padding: '0.75rem 2rem', borderRadius: '30px' }}
          disabled={currentIndex === 0} 
          onClick={() => setCurrentIndex(prev => prev - 1)}
        >
          Previous
        </button>
        
        {currentIndex === questions.length - 1 ? (
          <button className="cbtr-btn" style={{ backgroundColor: 'var(--cbtr-accent)', color: 'white', padding: '0.75rem 2rem', borderRadius: '30px', fontWeight: 'bold' }} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        ) : (
          <button 
            className="cbtr-btn cbtr-btn-primary" 
            style={{ padding: '0.75rem 2rem', borderRadius: '30px' }}
            onClick={() => setCurrentIndex(prev => prev + 1)}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default TestSession;
