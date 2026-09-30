import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Settings } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Sidebar = () => {
  const { user } = useAuth();

  // Define nav items based on reference
  const navItems = [
    { name: 'Beranda', path: '/dashboard', icon: <LayoutDashboard size={20} />, group: 'Menu' },
    { name: 'Kelas', path: '/browse', icon: <BookOpen size={20} />, group: 'Menu' }
  ];

  const otherItems = [
    { name: 'Pengaturan', path: '/settings', icon: <Settings size={20} />, group: 'Lainnya' }
  ];

  if (user?.role === 'Admin') {
    navItems.length = 0; // Clear student items
    navItems.push(
      { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} />, group: 'Menu' },
      { name: 'Manage Courses', path: '/admin/courses', icon: <BookOpen size={20} />, group: 'Menu' },
      { name: 'Manage Questions', path: '/admin/questions', icon: <BookOpen size={20} />, group: 'Menu' }
    );
  }

  return (
    <aside className="cbtr-sidebar">
      <div className="cbtr-sidebar-logo">
        <h1 style={{ color: 'var(--cbtr-primary)', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
          CBTR <span style={{ fontWeight: 'normal', color: 'var(--cbtr-text-secondary)', fontSize: '0.875rem' }}>Revision</span>
        </h1>
      </div>
      
      <div className="cbtr-sidebar-group">
        <p className="cbtr-sidebar-group-label">Menu</p>
        <ul className="cbtr-sidebar-nav">
          {navItems.map(item => (
            <li key={item.path}>
              <NavLink 
                to={item.path}
                className={({ isActive }) => `cbtr-nav-item ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="cbtr-sidebar-group">
        <p className="cbtr-sidebar-group-label">Lainnya</p>
        <ul className="cbtr-sidebar-nav">
          {otherItems.map(item => (
            <li key={item.path}>
              <NavLink 
                to={item.path}
                className={({ isActive }) => `cbtr-nav-item ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
