import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, Star, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

const TestResults = () => {
  const { sessionId } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get(`/student/sessions/${sessionId}/results`);
        setResults(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [sessionId]);

  if (loading) return <div className="container">Loading results...</div>;
  if (!results) return <div className="container">Results not found.</div>;

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div className="cbtr-course-card" style={{ padding: '3rem 2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cbtr-navy)' }}>
          <Trophy size={32} color="var(--cbtr-warning)" /> Test Completed
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--cbtr-text-secondary)', margin: 0, textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: 'bold' }}>Score</p>
            <p style={{ fontSize: '3.5rem', fontWeight: 'bold', margin: '0.5rem 0', color: 'var(--cbtr-primary)' }}>
              {results.summary.score} <span style={{ fontSize: '1.5rem', color: 'var(--cbtr-text-secondary)' }}>/ {results.details.length}</span>
            </p>
          </div>
          <div style={{ width: '1px', backgroundColor: 'var(--cbtr-border)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--cbtr-text-secondary)', margin: 0, textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: 'bold' }}>Points Earned</p>
            <p style={{ fontSize: '3.5rem', fontWeight: 'bold', margin: '0.5rem 0', color: 'var(--cbtr-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Star size={36} fill="var(--cbtr-warning)" color="var(--cbtr-warning)" /> +{results.summary.pointsAwarded}
            </p>
          </div>
        </div>
        <div style={{ marginTop: '2.5rem', width: '100%', maxWidth: '300px' }}>
          <Link to="/dashboard" className="cbtr-btn cbtr-btn-primary" style={{ display: 'block', textAlign: 'center', padding: '1rem', borderRadius: '30px', fontSize: '1.1rem' }}>Back to Dashboard</Link>
        </div>
      </div>

      <h3>Detailed Feedback</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {results.details.map((q, idx) => (
          <div key={idx} className="card" style={{ borderLeft: `6px solid ${q.isCorrect ? 'var(--cbtr-success)' : 'var(--cbtr-danger)'}`, borderRadius: '16px' }}>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--cbtr-navy)' }}>Question {idx + 1}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: q.isCorrect ? 'var(--cbtr-success)' : 'var(--cbtr-danger)', fontWeight: 'bold' }}>
                {q.isCorrect ? <CheckCircle size={18} /> : <XCircle size={18} />}
                {q.isCorrect ? 'Correct' : 'Incorrect'}
              </span>
            </div>
            <p style={{ fontWeight: '500', marginBottom: '1.5rem', fontSize: '1.1rem' }}>{q.questionText}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', backgroundColor: 'var(--cbtr-bg)', borderRadius: '12px' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--cbtr-text-secondary)', margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontWeight: 'bold' }}>Your Answer</p>
                <p style={{ margin: 0, fontWeight: '500', color: q.isCorrect ? 'var(--cbtr-success)' : 'var(--cbtr-danger)' }}>
                  {q.selectedText || 'No answer provided'}
                </p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--cbtr-bg)', borderRadius: '12px' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--cbtr-text-secondary)', margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontWeight: 'bold' }}>Correct Answer</p>
                <p style={{ margin: 0, fontWeight: '500', color: 'var(--cbtr-success)' }}>
                  {q.correctText}
                </p>
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--cbtr-badge-purple)', borderRadius: '12px' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--cbtr-primary)', margin: '0 0 0.5rem 0' }}>Explanation</p>
              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--cbtr-text-primary)' }}>{q.explanation || 'No explanation provided.'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestResults;
