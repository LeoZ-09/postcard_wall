import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './PostcardCard.css';

function PostcardCard({ postcard, index = 0 }) {
  const [showBack, setShowBack] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, index * 150);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [index]);

  const statusMap = {
    pending: { label: '待寄出', className: 'status-pending' },
    sent: { label: '运输中', className: 'status-sent' },
    delivered: { label: '已送达', className: 'status-delivered' }
  };

  const status = statusMap[postcard.status] || statusMap.pending;

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      ref={cardRef}
      className={`postcard-card ${isVisible ? 'visible' : ''}`}
    >
      <Link to={`/postcards/${postcard.id}`} className="postcard-link">
        <div className="postcard-images">
          <div
            className={`postcard-image-container ${showBack ? 'flipped' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setShowBack(!showBack);
            }}
          >
            <img
              src={postcard.front_url}
              alt="Front"
              className="postcard-image"
              onError={handleImageError}
              loading="lazy"
            />
            <img
              src={postcard.back_url}
              alt="Back"
              className="postcard-image postcard-image-back"
              onError={handleImageError}
              loading="lazy"
            />
          </div>
        </div>

        {imageError && (
          <div className="image-error">
            <span>图片加载失败</span>
          </div>
        )}

        <div className="postcard-info">
          <div className="postcard-header">
            <span className={`postcard-status ${status.className}`}>
              {status.label}
            </span>
            <span className="postcard-code">{postcard.code}</span>
          </div>

          <div className="postcard-details">
            {postcard.sender_name && (
              <div className="postcard-detail">
                <span className="detail-label">寄:</span>
                <span className="detail-value">{postcard.sender_name}</span>
              </div>
            )}
            {postcard.recipient_name && (
              <div className="postcard-detail">
                <span className="detail-label">收:</span>
                <span className="detail-value">{postcard.recipient_name}</span>
              </div>
            )}
            {postcard.delivery_days && (
              <div className="postcard-detail">
                <span className="detail-label">耗时:</span>
                <span className="detail-value">{postcard.delivery_days} 天</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      <button
        className="flip-hint"
        onClick={(e) => {
          e.preventDefault();
          setShowBack(!showBack);
        }}
      >
        {showBack ? '正面' : '背面'}
      </button>
    </div>
  );
}

export default PostcardCard;
