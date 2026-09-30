import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="cbtr-layout">
      <Sidebar />
      <div className="cbtr-main-wrapper">
        <Header />
        <main className="cbtr-main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
