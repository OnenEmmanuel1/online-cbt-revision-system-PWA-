import React from 'react';
import { Bell, LogOut, Search } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="cbtr-header">
      {/* Search Bar matching QLTSGeek */}
      <div className="cbtr-header-search">
        <Search size={18} />
        <input type="text" placeholder="Search for courses, topics..." />
      </div>
      <div className="cbtr-header-right">
        <button className="cbtr-icon-btn" aria-label="Notifications">
          <Bell size={20} />
        </button>
        
        <div className="cbtr-user-profile">
          <div className="cbtr-avatar">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="cbtr-user-info">
            <span className="cbtr-user-name">{user?.fullName}</span>
            <span className="cbtr-user-role">{user?.role === 'Student' ? 'Mahasiswa' : 'Administrator'}</span>
          </div>
        </div>

        <button className="cbtr-icon-btn" onClick={handleLogout} title="Logout">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
