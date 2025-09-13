import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateUserProfile, loading } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    avatar: ''
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.username.trim()) {
      setMessage({ type: 'error', text: '用户名不能为空' });
      return;
    }

    if (!formData.email.trim()) {
      setMessage({ type: 'error', text: '邮箱不能为空' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setMessage({ type: 'error', text: '请输入有效的邮箱地址' });
      return;
    }

    const result = await updateUserProfile(formData);
    
    if (result.success) {
      setMessage({ type: 'success', text: '个人信息更新成功！' });
      setIsEditing(false);
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } else {
      setMessage({ type: 'error', text: result.error || '更新失败' });
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      avatar: user.avatar || ''
    });
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const handlePasswordSave = async () => {
    if (!passwordData.oldPassword) {
      setMessage({ type: 'error', text: '请输入原密码' });
      return;
    }

    if (!passwordData.newPassword) {
      setMessage({ type: 'error', text: '请输入新密码' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: '新密码至少6位' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: '两次密码不一致' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/user/password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          old_password: passwordData.oldPassword,
          new_password: passwordData.newPassword,
        }),
      });

      const data = await response.json();
      
      if (data.code === 0) {
        setMessage({ type: 'success', text: '密码修改成功！' });
        setShowPasswordModal(false);
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      } else {
        setMessage({ type: 'error', text: data.message || '密码修改失败' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '网络错误，请稍后重试' });
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordModal(false);
    setPasswordData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setMessage({ type: '', text: '' });
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="loading-message">请先登录...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>个人信息</h1>
          <p>管理您的账户信息和偏好设置</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="profile-content">
          <div className="profile-section">
            <div className="avatar-section">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.username} 
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
              {isEditing && (
                <div className="avatar-actions">
                  <button className="change-avatar-btn">
                    更换头像
                  </button>
                  <p className="avatar-hint">支持 JPG、PNG 格式，最大 2MB</p>
                </div>
              )}
            </div>

            <div className="profile-form">
              <div className="form-group">
                <label>用户名</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="profile-input"
                />
                <span className="input-hint">用户名用于登录和显示</span>
              </div>

              <div className="form-group">
                <label>邮箱地址</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="profile-input"
                />
                <span className="input-hint">用于接收重要通知和找回密码</span>
              </div>

              <div className="form-group">
                <label>手机号码</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="profile-input"
                />
                <span className="input-hint">用于接收订单通知和客服联系</span>
              </div>

              <div className="form-group">
                <label>头像地址</label>
                <input
                  type="url"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="profile-input"
                  placeholder="https://example.com/avatar.jpg"
                />
                <span className="input-hint">输入头像图片的URL地址</span>
              </div>

              <div className="profile-actions">
                {isEditing ? (
                  <>
                    <button 
                      className="save-button" 
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? '保存中...' : '保存更改'}
                    </button>
                    <button 
                      className="cancel-button" 
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      取消
                    </button>
                  </>
                ) : (
                  <button 
                    className="edit-button"
                    onClick={() => setIsEditing(true)}
                  >
                    编辑信息
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="profile-sidebar">
            <div className="info-card">
              <h3>账户信息</h3>
              <div className="info-item">
                <span className="info-label">用户ID：</span>
                <span className="info-value">{user.id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">注册时间：</span>
                <span className="info-value">{user.created_at || '未知'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">最后更新：</span>
                <span className="info-value">{user.updated_at || '未知'}</span>
              </div>
            </div>

            <div className="password-section">
              <h3>账户安全</h3>
              <button 
                className="change-password-btn"
                onClick={() => setShowPasswordModal(true)}
              >
                修改密码
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 修改密码模态框 */}
      {showPasswordModal && (
        <div className="password-modal-overlay" onClick={handlePasswordCancel}>
          <div className="password-modal" onClick={(e) => e.stopPropagation()}>
            <button className="password-modal-close" onClick={handlePasswordCancel}>
              ✕
            </button>
            
            <div className="password-modal-header">
              <h2>修改密码</h2>
              <p>请输入原密码和新密码</p>
            </div>

            <div className="password-modal-content">
              <div className="form-group">
                <label>原密码</label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  className="password-input"
                  placeholder="请输入原密码"
                />
              </div>

              <div className="form-group">
                <label>新密码</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="password-input"
                  placeholder="请输入新密码（至少6位）"
                />
              </div>

              <div className="form-group">
                <label>确认新密码</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="password-input"
                  placeholder="请再次输入新密码"
                />
              </div>

              <div className="password-modal-actions">
                <button 
                  className="save-button" 
                  onClick={handlePasswordSave}
                  disabled={loading}
                >
                  {loading ? '保存中...' : '保存密码'}
                </button>
                <button 
                  className="cancel-button" 
                  onClick={handlePasswordCancel}
                  disabled={loading}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 