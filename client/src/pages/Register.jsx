import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Mail, Lock, BookOpen, User, Building, ShieldCheck } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Student',
    institution: ''
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
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
          <h2>Create an account</h2>
          <p>Join CBTR to start your revision journey</p>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ display: 'block', marginBottom: '1.5rem', padding: '0.75rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="cbtr-form-label">Full Name</label>
            <div className="cbtr-input-wrapper">
              <User className="cbtr-input-icon" size={20} />
              <input 
                type="text" 
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="cbtr-form-label">Email</label>
            <div className="cbtr-input-wrapper">
              <Mail className="cbtr-input-icon" size={20} />
              <input 
                type="email" 
                name="email"
                placeholder="Enter your email"
                value={formData.email} 
                onChange={handleChange} 
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
                name="password"
                placeholder="••••••••"
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="cbtr-form-label">Institution</label>
            <div className="cbtr-input-wrapper">
              <Building className="cbtr-input-icon" size={20} />
              <input 
                type="text" 
                name="institution"
                placeholder="University Name"
                value={formData.institution} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <button type="submit" className="cbtr-auth-btn">
            Create Account
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'var(--cbtr-text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--cbtr-primary)', fontWeight: '600', textDecoration: 'none' }}>Log in here</Link>
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
        
        <h1>Join our community<br/>of active learners</h1>
        <p>Set up your account today to access hundreds of practice questions and start improving your scores immediately.</p>
      </div>
    </div>
  );
};

export default Register;
