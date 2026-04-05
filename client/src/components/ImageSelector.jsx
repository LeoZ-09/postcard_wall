import React, { useState, useEffect } from 'react';
import { imageApi } from '../services/api';
import './ImageSelector.css';

function ImageSelector({ onSelect, selectedImageId, label }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (showModal) {
      loadImages(1);
    }
  }, [showModal]);

  const loadImages = async (pageNum) => {
    setLoading(true);
    try {
      const response = await imageApi.getAll({ page: pageNum, limit: 20 });
      setImages(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (image) => {
    setSelectedImage(image);
  };

  const handleConfirm = () => {
    if (selectedImage) {
      onSelect(selectedImage);
      setShowModal(false);
      setSelectedImage(null);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const selectedImg = images.find(img => img.id === selectedImageId);

  return (
    <div className="image-selector">
      <label className="form-label">{label || '选择图片'}</label>

      {selectedImageId && selectedImg ? (
        <div className="selected-image-preview">
          <img src={selectedImg.url} alt="Selected" />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowModal(true)}
          >
            更换图片
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-primary select-image-btn"
          onClick={() => setShowModal(true)}
        >
          选择图片
        </button>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content image-selector-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">选择图片</h3>
              <button className="modal-close" onClick={handleClose}>&times;</button>
            </div>

            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
              </div>
            ) : (
              <>
                <div className="image-grid">
                  {images.map(image => (
                    <div
                      key={image.id}
                      className={`image-item ${selectedImage?.id === image.id ? 'selected' : ''}`}
                      onClick={() => handleSelect(image)}
                    >
                      <img src={image.url} alt={image.original_name} />
                      {selectedImage?.id === image.id && (
                        <div className="selected-check">✓</div>
                      )}
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="modal-pagination">
                    <button
                      onClick={() => loadImages(page - 1)}
                      disabled={page === 1}
                    >
                      上一页
                    </button>
                    <span>{page} / {totalPages}</span>
                    <button
                      onClick={() => loadImages(page + 1)}
                      disabled={page === totalPages}
                    >
                      下一页
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleClose}>
                取消
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirm}
                disabled={!selectedImage}
              >
                确认选择
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageSelector;
