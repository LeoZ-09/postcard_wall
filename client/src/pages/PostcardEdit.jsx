import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postcardApi } from '../services/api';
import ImageSelector from '../components/ImageSelector';
import './PostcardForm.css';

function PostcardEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    senderName: '',
    recipientName: '',
    sentDate: '',
    deliveredDate: '',
    description: '',
    status: 'pending'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadPostcard();
  }, [id]);

  const loadPostcard = async () => {
    try {
      const response = await postcardApi.getById(id);
      const postcard = response.data.data;

      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
      };

      setFormData({
        senderName: postcard.sender_name || '',
        recipientName: postcard.recipient_name || '',
        sentDate: formatDate(postcard.sent_date),
        deliveredDate: formatDate(postcard.delivered_date),
        description: postcard.description || '',
        status: postcard.status || 'pending'
      });
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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
      await postcardApi.update(id, {
        senderName: formData.senderName || undefined,
        recipientName: formData.recipientName || undefined,
        sentDate: formData.sentDate || undefined,
        deliveredDate: formData.deliveredDate || undefined,
        description: formData.description || undefined,
        status: formData.status
      });
      navigate(`/postcards/${id}`);
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: error.message }));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="postcard-form container">
      <div className="page-header">
        <h1 className="page-title">编辑明信片</h1>
        <Link to={`/postcards/${id}`} className="btn btn-secondary">返回详情</Link>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        {errors.submit && <div className="error-message">{errors.submit}</div>}

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
              rows="4"
            />
            {errors.description && <div className="form-error">{errors.description}</div>}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`/postcards/${id}`)}
          >
            取消
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '保存中...' : '保存更改'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PostcardEdit;
