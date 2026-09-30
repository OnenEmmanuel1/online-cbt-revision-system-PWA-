import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Mail, Lock, BookOpen } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      if (user.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="cbtr-auth-layout">
      {/* Left Form Panel */}
      <div className="cbtr-auth-form-panel">
        <div className="cbtr-auth-logo">
          <div style={{ backgroundColor: 'var(--cbtr-primary)', color: 'white', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
            <BookOpen size={24} />
          </div>
          CBTR
        </div>

        <div className="cbtr-auth-header">
          <h2>Log in to your account</h2>
          <p>Please enter your details</p>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ display: 'block', marginBottom: '1.5rem', padding: '0.75rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="cbtr-form-label">Email</label>
            <div className="cbtr-input-wrapper">
              <Mail className="cbtr-input-icon" size={20} />
              <input 
                type="email" 
                placeholder="Enter your email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="cbtr-form-label">Password</label>
            <div className="cbtr-input-wrapper">
              <Lock className="cbtr-input-icon" size={20} />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="cbtr-auth-options">
            <label>
              <input type="checkbox" /> Remember for 30 days
            </label>
            <a href="#">Forgot password</a>
          </div>

          <button type="submit" className="cbtr-auth-btn">
            Log in
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'var(--cbtr-text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--cbtr-primary)', fontWeight: '600', textDecoration: 'none' }}>Register here</Link>
        </div>
      </div>

      {/* Right Brand Panel */}
      <div className="cbtr-auth-brand-panel">
        <div className="cbtr-auth-decoration"></div>
        <div className="cbtr-auth-decoration-circles"></div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4rem', zIndex: 2 }}>
          <BookOpen size={32} />
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>CBTR Platform</span>
        </div>
        
        <h1>Empowering smarter<br/>revision journeys</h1>
        <p>Master your coursework with self-paced practice tests, detailed performance analytics, and seamless offline learning.</p>
      </div>
    </div>
  );
};

export default Login;
