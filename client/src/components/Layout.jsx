import React from 'react';
import { Outlet } from 'react-router-dom';
import './Layout.css';

function Layout() {
  return (
    <div className="layout">
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
