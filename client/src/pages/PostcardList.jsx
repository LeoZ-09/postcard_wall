import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postcardApi } from '../services/api';
import PostcardCard from '../components/PostcardCard';
import Pagination from '../components/Pagination';
import FloatingButton from '../components/FloatingButton';
import PostcardModal from '../components/PostcardModal';
import './PostcardList.css';

function PostcardList() {
  const [postcards, setPostcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    senderName: '',
    recipientName: ''
  });

  useEffect(() => {
    loadPostcards();
  }, [page, filters.status]);

  const loadPostcards = async () => {
    setLoading(true);
    try {
      const response = await postcardApi.getAll({
        page,
        limit: 20,
        status: filters.status || undefined,
        senderName: filters.senderName || undefined,
        recipientName: filters.recipientName || undefined
      });
      setPostcards(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('加载数据失败:', error);
      setError(error.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setPage(1);
    loadPostcards();
  };

  const handleResetFilters = () => {
    setFilters({ status: '', senderName: '', recipientName: '' });
    setPage(1);
    loadPostcards();
  };

  if (loading && postcards.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="postcard-list">
      <FloatingButton onAddClick={() => setShowAddModal(true)} />
      <PostcardModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />

      <div className="list-header">
        <button
          className={`icon-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
          title="筛选"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
        </button>
      </div>

      {showFilters && (
        <div className="filter-bar">
          <div className="filters">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="input filter-select"
            >
              <option value="">状态</option>
              <option value="pending">待寄出</option>
              <option value="sent">运输中</option>
              <option value="delivered">已送达</option>
            </select>
            <input
              type="text"
              name="senderName"
              placeholder="寄件人"
              value={filters.senderName}
              onChange={handleFilterChange}
              className="input filter-input"
            />
            <input
              type="text"
              name="recipientName"
              placeholder="收件人"
              value={filters.recipientName}
              onChange={handleFilterChange}
              className="input filter-input"
            />
          </div>
          <div className="filter-actions">
            <button className="btn btn-sm" onClick={handleApplyFilters}>应用</button>
            <button className="btn btn-sm secondary" onClick={handleResetFilters}>重置</button>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {postcards.length > 0 ? (
        <>
          <div className="gallery-container">
            <div className="postcard-grid-full">
              {postcards.map((postcard, index) => (
                <PostcardCard
                  key={postcard.id}
                  postcard={postcard}
                  index={index}
                />
              ))}
            </div>
          </div>
          {totalPages > 1 && (
            <div className="pagination-container">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      ) : (
        <div className="empty-state-full">
          <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" fill="none" strokeWidth="1.5" className="empty-icon">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="M22 7l-10 5L2 7"/>
          </svg>
          <p className="empty-title">没有明信片</p>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>创建第一张</button>
        </div>
      )}
    </div>
  );
}

export default PostcardList;
