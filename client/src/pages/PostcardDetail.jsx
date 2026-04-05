import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { postcardApi } from '../services/api';
import './PostcardDetail.css';

function PostcardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [postcard, setPostcard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBack, setShowBack] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadPostcard();
  }, [id]);

  const loadPostcard = async () => {
    try {
      const response = await postcardApi.getById(id);
      setPostcard(response.data.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await postcardApi.delete(id);
      navigate('/postcards');
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (error || !postcard) {
    return (
      <div className="container">
        <div className="error-message">{error || 'Postcard not found'}</div>
        <Link to="/postcards" className="btn btn-secondary">返回列表</Link>
      </div>
    );
  }

  const statusMap = {
    pending: { label: '待寄出', className: 'status-pending' },
    sent: { label: '运输中', className: 'status-sent' },
    delivered: { label: '已送达', className: 'status-delivered' }
  };

  const status = statusMap[postcard.status] || statusMap.pending;

  return (
    <div className="postcard-detail container">
      <div className="page-header">
        <div>
          <h1 className="page-title">明信片详情</h1>
          <span className="postcard-code-lg">编码: {postcard.code}</span>
        </div>
        <div className="actions">
          <Link to={`/postcards/${id}/edit`} className="btn btn-secondary">
            编辑
          </Link>
          <button
            className="btn btn-danger"
            onClick={() => setShowDeleteModal(true)}
          >
            删除
          </button>
        </div>
      </div>

      <div className="detail-content">
        <div className="postcard-viewer">
          <div className="viewer-main">
            <div
              className={`postcard-container ${showBack ? 'show-back' : ''}`}
              onClick={() => setShowBack(!showBack)}
            >
              <img
                src={postcard.front_url}
                alt="Front"
                className="postcard-img"
              />
              <img
                src={postcard.back_url}
                alt="Back"
                className="postcard-img postcard-img-back"
              />
            </div>
            <button
              className="btn btn-secondary flip-btn"
              onClick={() => setShowBack(!showBack)}
            >
              {showBack ? '显示正面' : '显示背面'}
            </button>
          </div>
        </div>

        <div className="postcard-info-panel">
          <div className="info-section">
            <h3>状态信息</h3>
            <div className="info-row">
              <span className="info-label">状态:</span>
              <span className={`status-badge ${status.className}`}>
                {status.label}
              </span>
            </div>
            {postcard.delivery_days && (
              <div className="info-row">
                <span className="info-label">寄送天数:</span>
                <span className="info-value">{postcard.delivery_days} 天</span>
              </div>
            )}
          </div>

          <div className="info-section">
            <h3>人员信息</h3>
            {postcard.sender_name && (
              <div className="info-row">
                <span className="info-label">寄件人:</span>
                <span className="info-value">{postcard.sender_name}</span>
              </div>
            )}
            {postcard.recipient_name && (
              <div className="info-row">
                <span className="info-label">收件人:</span>
                <span className="info-value">{postcard.recipient_name}</span>
              </div>
            )}
          </div>

          <div className="info-section">
            <h3>日期信息</h3>
            {postcard.sent_date && (
              <div className="info-row">
                <span className="info-label">寄出日期:</span>
                <span className="info-value">
                  {new Date(postcard.sent_date).toLocaleDateString('zh-CN')}
                </span>
              </div>
            )}
            {postcard.delivered_date && (
              <div className="info-row">
                <span className="info-label">送达日期:</span>
                <span className="info-value">
                  {new Date(postcard.delivered_date).toLocaleDateString('zh-CN')}
                </span>
              </div>
            )}
            <div className="info-row">
              <span className="info-label">创建时间:</span>
              <span className="info-value">
                {new Date(postcard.created_at).toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>

          {postcard.description && (
            <div className="info-section">
              <h3>描述</h3>
              <p className="description">{postcard.description}</p>
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>确认删除</h3>
            <p>确定要删除这张明信片吗？此操作不可撤销。</p>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                取消
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostcardDetail;
