import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseBrowse from './pages/CourseBrowse';
import TestSetup from './pages/TestSetup';
import TestSession from './pages/TestSession';
import TestResults from './pages/TestResults';
import AdminDashboard from './pages/AdminDashboard';
import AdminCourses from './pages/AdminCourses';
import AdminQuestions from './pages/AdminQuestions';
import Settings from './pages/Settings';
import useAuth from './hooks/useAuth';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/dashboard" />;
  
  return <Layout>{children}</Layout>;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={<ProtectedRoute allowedRole="Student"><Dashboard /></ProtectedRoute>} />
        <Route path="/browse" element={<ProtectedRoute allowedRole="Student"><CourseBrowse /></ProtectedRoute>} />
        <Route path="/test/setup" element={<ProtectedRoute allowedRole="Student"><TestSetup /></ProtectedRoute>} />
        <Route path="/test/session" element={<ProtectedRoute allowedRole="Student"><TestSession /></ProtectedRoute>} />
        <Route path="/results/:sessionId" element={<ProtectedRoute allowedRole="Student"><TestResults /></ProtectedRoute>} />
        
        <Route path="/admin" element={<ProtectedRoute allowedRole="Admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/courses" element={<ProtectedRoute allowedRole="Admin"><AdminCourses /></ProtectedRoute>} />
        <Route path="/admin/questions" element={<ProtectedRoute allowedRole="Admin"><AdminQuestions /></ProtectedRoute>} />
        
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
