import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';
import { useCartAnimation } from '../contexts/CartAnimationContext';
import { useFavorite } from '../contexts/FavoriteContext';
import AuthModal from './AuthModal';
import UserDropdown from './UserDropdown';
import CartAnimation from './CartAnimation';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userSectionRef = useRef(null);
  const { getTotalItems } = useCart();
  const { user, logout } = useUser();
  const { cartAnimation, cartButtonRef, cartBadgeRef, handleAnimationComplete } = useCartAnimation();
  const { favoriteCount, fetchFavoriteCount } = useFavorite();

  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: 'login'
  });
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // [新增] 监听路由变化，自动关闭菜单
  useEffect(() => {
    setShowUserDropdown(false);
  }, [location]);

  // [新增] 监听点击屏幕其他地方，自动关闭菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 如果点击的不是 userSection 及其内部元素，且菜单是打开的
      if (userSectionRef.current && !userSectionRef.current.contains(event.target) && showUserDropdown) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  // 获取收藏数量
  React.useEffect(() => {
    if (user) {
      fetchFavoriteCount();
    }
  }, [user, fetchFavoriteCount]);

  const openAuthModal = (mode) => {
    setAuthModal({
      isOpen: true,
      mode
    });
  };

  const closeAuthModal = () => {
    setAuthModal({
      isOpen: false,
      mode: 'login'
    });
  };

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
      <header className="header">
        <div className="header-container">
          <Link to="/" className="logo">
            <div className="logo-icon">📚</div>
            <span className="logo-text">博学书城</span>
          </Link>

          <div className="search-container">
            <form onSubmit={handleSearch} className="search-box">
              <div className="search-icon">🔍</div>
              <input
                type="text"
                placeholder="搜索书籍、作者"
                className="search-input"
                value={searchQuery}
                onChange={handleSearchInputChange}
              />
              <button type="submit" className="search-btn">搜索</button>
            </form>
          </div>

          <div className="header-actions">
            {/* 收藏夹按钮 */}
            {user && (
              <Link to="/favorites" className="favorite-button">
                <span className="favorite-icon">❤️</span>
                <span className="favorite-text">收藏夹</span>
                {favoriteCount > 0 && (
                  <span className="favorite-badge">{favoriteCount}</span>
                )}
              </Link>
            )}

            <Link to="/cart" className="cart-button" ref={cartButtonRef}>
              <span className="cart-icon">🛒</span>
              <span className="cart-text">购物车</span>
              {getTotalItems() > 0 && (
                <span className="cart-badge" ref={cartBadgeRef}>{getTotalItems()}</span>
              )}
            </Link>

            {user ? (
              <div className="user-section" ref={userSectionRef}>
                <div className="user-avatar-container" onClick={toggleUserDropdown}>
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="user-avatar"
                    />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="user-name">{user.username}</span>
                  <span className="dropdown-arrow">▼</span>
                </div>

                {showUserDropdown && (
                  <UserDropdown
                    user={user}
                    onLogout={handleLogout}
                    onClose={() => setShowUserDropdown(false)}
                  />
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <button
                  className="auth-btn login-btn"
                  onClick={() => openAuthModal('login')}
                >
                  登录
                </button>
                <button
                  className="auth-btn register-btn"
                  onClick={() => openAuthModal('register')}
                >
                  注册
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        initialMode={authModal.mode}
      />

      <CartAnimation
        isVisible={cartAnimation.isVisible}
        startPosition={cartAnimation.startPosition}
        endPosition={cartAnimation.endPosition}
        onAnimationComplete={handleAnimationComplete}
      />
    </>
  );
};

export default Header; 