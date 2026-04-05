import React, { useState, useEffect } from 'react';
import { imageApi } from '../services/api';
import Pagination from '../components/Pagination';
import './ImageLibrary.css';

function ImageLibrary() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadImages();
  }, [page]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const response = await imageApi.getAll({ page, limit: 24 });
      setImages(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        await imageApi.upload(formData);
      }
      loadImages();
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedImage) return;

    try {
      await imageApi.delete(selectedImage.id);
      setShowDeleteModal(false);
      setSelectedImage(null);
      loadImages();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="image-library container">
      <div className="page-header">
        <h1 className="page-title">图片库</h1>
        <div className="upload-btn-wrapper">
          <button
            type="button"
            className="btn btn-primary"
            disabled={uploading}
          >
            {uploading ? '上传中...' : '上传图片'}
          </button>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={uploading}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : images.length > 0 ? (
        <>
          <div className="image-grid">
            {images.map(image => (
              <div
                key={image.id}
                className="image-card"
                onClick={() => setSelectedImage(image)}
              >
                <img src={image.url} alt={image.original_name} />
                <div className="image-overlay">
                  <span className="image-name">{image.original_name}</span>
                  <span className="image-size">
                    {(image.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      ) : (
        <div className="empty-state">
          <p>还没有上传图片</p>
          <div className="upload-btn-wrapper">
            <button type="button" className="btn btn-primary">
              上传第一张图片
            </button>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
            />
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="modal-content image-preview-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{selectedImage.original_name}</h3>
              <button className="modal-close" onClick={() => setSelectedImage(null)}>&times;</button>
            </div>
            <img src={selectedImage.url} alt={selectedImage.original_name} className="preview-image" />
            <div className="image-details">
              <p>大小: {(selectedImage.size / 1024).toFixed(1)} KB</p>
              {selectedImage.width && selectedImage.height && (
                <p>尺寸: {selectedImage.width} x {selectedImage.height}</p>
              )}
              <p>上传时间: {new Date(selectedImage.created_at).toLocaleDateString('zh-CN')}</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-danger"
                onClick={() => setShowDeleteModal(true)}
              >
                删除
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedImage(null)}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>确认删除</h3>
            <p>确定要删除这张图片吗？如果图片正在被明信片使用，将无法删除。</p>
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

export default ImageLibrary;
