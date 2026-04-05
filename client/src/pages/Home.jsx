import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postcardApi } from '../services/api';
import PostcardCard from '../components/PostcardCard';
import FloatingButton from '../components/FloatingButton';
import PostcardModal from '../components/PostcardModal';
import './Home.css';

function Home() {
  const [postcards, setPostcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSplash, setShowSplash] = useState(false);
  const [splashVisible, setSplashVisible] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (!hasSeenSplash) {
      setShowSplash(true);
      setSplashVisible(true);
      sessionStorage.setItem('hasSeenSplash', 'true');
      setTimeout(() => {
        setSplashVisible(false);
        setTimeout(() => setShowSplash(false), 400);
      }, 1200);
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const postcardsRes = await postcardApi.getAll({ page: 1, limit: 20 });
      setPostcards(postcardsRes.data.data);
    } catch (error) {
      console.error('加载数据失败:', error);
      setError(error.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="home">
      <FloatingButton onAddClick={() => setShowAddModal(true)} />

      <PostcardModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />

      {showSplash && (
        <div className={`splash-overlay ${splashVisible ? 'visible' : ''}`}>
          <div className="splash-content">
            <div className="splash-icon">✉</div>
            <div className="splash-title">明信片墙</div>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {postcards.length > 0 ? (
        <div className="postcard-grid-full">
          {postcards.map((postcard, index) => (
            <PostcardCard
              key={postcard.id}
              postcard={postcard}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state-full">
          <button className="empty-add-btn" onClick={() => setShowAddModal(true)} title="创建明信片">
            <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" fill="none" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </button>
          <p className="empty-hint">点击添加第一张明信片</p>
        </div>
      )}
    </div>
  );
}

export default Home;
