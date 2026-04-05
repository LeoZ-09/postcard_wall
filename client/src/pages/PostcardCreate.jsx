import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { postcardApi, imageApi } from '../services/api';
import ImageSelector from '../components/ImageSelector';
import './PostcardForm.css';

function PostcardCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(null);
  const [formData, setFormData] = useState({
    frontImageId: '',
    backImageId: '',
    senderName: '',
    recipientName: '',
    sentDate: '',
    deliveredDate: '',
    description: '',
    status: 'pending'
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageSelect = (field, image) => {
    setFormData(prev => ({ ...prev, [`${field}ImageId`]: image.id }));
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(field);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const response = await imageApi.upload(formDataUpload);
      const imageData = response.data.data;

      setFormData(prev => ({
        ...prev,
        [`${field}ImageId`]: imageData.id
      }));
    } catch (error) {
      setErrors(prev => ({ ...prev, [field]: error.message }));
    } finally {
      setUploadingImage(null);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (formData.senderName && formData.senderName.length > 100) {
      newErrors.senderName = '寄件人名称不能超过100个字符';
    }
    if (formData.recipientName && formData.recipientName.length > 100) {
      newErrors.recipientName = '收件人名称不能超过100个字符';
    }
    if (formData.description && formData.description.length > 500) {
      newErrors.description = '描述不能超过500个字符';
    }
    if (formData.sentDate && formData.deliveredDate && formData.sentDate > formData.deliveredDate) {
      newErrors.deliveredDate = '送达日期不能早于寄出日期';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await postcardApi.create({
        frontImageId: formData.frontImageId || undefined,
        backImageId: formData.backImageId || undefined,
        senderName: formData.senderName || undefined,
        recipientName: formData.recipientName || undefined,
        sentDate: formData.sentDate || undefined,
        deliveredDate: formData.deliveredDate || undefined,
        description: formData.description || undefined,
        status: formData.status
      });
      navigate('/postcards');
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: error.message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="postcard-form container">
      <div className="page-header">
        <h1 className="page-title">创建明信片</h1>
        <Link to="/postcards" className="btn btn-secondary">返回</Link>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        {errors.submit && <div className="error-message">{errors.submit}</div>}

        <div className="form-section">
          <h3>图片信息</h3>
          <div className="form-row">
            <div className="form-group">
              <ImageSelector
                label="正面图片"
                selectedImageId={formData.frontImageId}
                onSelect={(img) => handleImageSelect('front', img)}
              />
              <div className="upload-btn-wrapper">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={uploadingImage === 'front'}
                >
                  {uploadingImage === 'front' ? '上传中...' : '上传'}
                </button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'front')}
                  disabled={uploadingImage === 'front'}
                />
              </div>
            </div>

            <div className="form-group">
              <ImageSelector
                label="背面图片"
                selectedImageId={formData.backImageId}
                onSelect={(img) => handleImageSelect('back', img)}
              />
              <div className="upload-btn-wrapper">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={uploadingImage === 'back'}
                >
                  {uploadingImage === 'back' ? '上传中...' : '上传'}
                </button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'back')}
                  disabled={uploadingImage === 'back'}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>人员信息</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">寄件人</label>
              <input
                type="text"
                name="senderName"
                value={formData.senderName}
                onChange={handleChange}
                className={`input ${errors.senderName ? 'input-error' : ''}`}
                placeholder="输入寄件人名称"
              />
              {errors.senderName && <div className="form-error">{errors.senderName}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">收件人</label>
              <input
                type="text"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                className={`input ${errors.recipientName ? 'input-error' : ''}`}
                placeholder="输入收件人名称"
              />
              {errors.recipientName && <div className="form-error">{errors.recipientName}</div>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>日期信息</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">寄出日期</label>
              <input
                type="date"
                name="sentDate"
                value={formData.sentDate}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">送达日期</label>
              <input
                type="date"
                name="deliveredDate"
                value={formData.deliveredDate}
                onChange={handleChange}
                className={`input ${errors.deliveredDate ? 'input-error' : ''}`}
              />
              {errors.deliveredDate && <div className="form-error">{errors.deliveredDate}</div>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>状态与描述</h3>
          <div className="form-group">
            <label className="form-label">状态</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input"
            >
              <option value="pending">待寄出</option>
              <option value="sent">运输中</option>
              <option value="delivered">已送达</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">描述</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`input ${errors.description ? 'input-error' : ''}`}
              placeholder="输入明信片描述..."
              rows="3"
            />
            {errors.description && <div className="form-error">{errors.description}</div>}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/postcards')}
          >
            取消
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '创建中...' : '创建'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PostcardCreate;
