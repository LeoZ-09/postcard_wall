import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './FloatingButton.css';

function FloatingButton({ onAddClick }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`fab-container ${isOpen ? 'open' : ''}`}>
      <div className="fab-backdrop" onClick={() => setIsOpen(false)} />
      <div className="fab-menu">
        <button
          className="fab-item"
          onClick={() => {
            setIsOpen(false);
            onAddClick?.();
          }}
          title="添加明信片"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>添加</span>
        </button>
        <Link to="/postcards" className="fab-item" onClick={() => setIsOpen(false)} title="明信片列表">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="M22 7l-10 5L2 7"/>
          </svg>
          <span>图库</span>
        </Link>
        <Link to="/images" className="fab-item" onClick={() => setIsOpen(false)} title="图片库">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
          <span>图片</span>
        </Link>
      </div>
      <button className="fab-main" onClick={toggleMenu} title="菜单">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" strokeWidth="2" className="fab-icon">
          <line x1="12" y1="5" x2="12" y2="19" className="icon-vertical"/>
          <line x1="5" y1="12" x2="19" y2="12" className="icon-horizontal"/>
        </svg>
      </button>
    </div>
  );
}

export default FloatingButton;
