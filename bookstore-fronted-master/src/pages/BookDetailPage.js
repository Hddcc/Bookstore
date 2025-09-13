import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { CartAnimationContext } from '../contexts/CartAnimationContext';
import { useCart } from '../contexts/CartContext';
import './BookDetailPage.css';

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { triggerCartAnimation } = useContext(CartAnimationContext);
  const { addToCart, clearCart, updateQuantity } = useCart();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const fetchBookDetail = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/book/detail/${id}`);
      const data = await response.json();
      
      if (data.code === 0) {
        setBook(data.data);
      } else {
        setError('获取书籍详情失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBookDetail();
  }, [fetchBookDetail]);

  const handleAddToCart = (e) => {
    if (book && book.stock > 0) {
      // 获取按钮位置用于动画
      const rect = e.currentTarget.getBoundingClientRect();
      const startPosition = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      
      triggerCartAnimation(startPosition);
      // 添加指定数量的商品到购物车
      for (let i = 0; i < quantity; i++) {
        addToCart({
          id: book.id,
          title: book.title,
          author: book.author,
          price: book.price,
          currentPrice: discountedPrice,
          imageUrl: book.cover_url,
          stock: book.stock
        });
      }
    }
  };

  const handleBuyNow = () => {
    if (book && book.stock > 0) {
      // 清空购物车，只添加当前书籍
      clearCart();
      
      // 添加商品到购物车
      addToCart({
        id: book.id,
        title: book.title,
        author: book.author,
        price: book.price,
        currentPrice: discountedPrice,
        imageUrl: book.cover_url,
        stock: book.stock
      });
      
      // 更新数量为选择的数量
      updateQuantity(book.id, quantity);
      
      // 跳转到结算页面
      navigate('/payment');
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= book.stock) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="book-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在加载书籍详情...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="book-detail-page">
        <div className="error-container">
          <p className="error-message">{error || '书籍不存在'}</p>
          <button onClick={() => navigate('/')} className="back-button">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const discountedPrice = Math.round(book.price * book.discount / 100);
  const hasDiscount = book.discount < 100;
  const outOfStock = book.stock <= 0;

  return (
    <div className="book-detail-page">
      <div className="detail-container">
        <div className="breadcrumb">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            ← 返回首页
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{book.title}</span>
        </div>

        <div className="book-detail-content">
          <div className="book-image-section">
            <div className="book-image-container">
              <img 
                src={book.cover_url || 'https://via.placeholder.com/400x600/4A90E2/FFFFFF?text=📚'} 
                alt={book.title}
                className="book-detail-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="book-placeholder" style={{ display: 'none' }}>
                <span className="placeholder-icon">📚</span>
                <p className="placeholder-text">暂无封面</p>
              </div>
              {outOfStock && <div className="out-of-stock-badge">缺货</div>}
              {hasDiscount && <div className="discount-badge">{100 - book.discount}% OFF</div>}
            </div>
          </div>

          <div className="book-info-section">
            <div className="book-header">
              <h1 className="book-title">{book.title}</h1>
              <p className="book-author">作者：{book.author}</p>
              <div className="book-type-badge">{book.type}</div>
            </div>

            <div className="book-price-section">
              <div className="price-info">
                {hasDiscount ? (
                  <>
                    <span className="current-price">¥{discountedPrice}</span>
                    <span className="original-price">¥{book.price}</span>
                    <span className="discount-text">节省 ¥{book.price - discountedPrice}</span>
                  </>
                ) : (
                  <span className="current-price">¥{book.price}</span>
                )}
              </div>
            </div>

            <div className="book-stock-section">
              <div className="stock-info">
                <span className={`stock-status ${outOfStock ? 'out-of-stock' : 'in-stock'}`}>
                  {outOfStock ? '暂时缺货' : `库存：${book.stock} 本`}
                </span>
                {!outOfStock && (
                  <div className="quantity-selector">
                    <label>数量：</label>
                    <button 
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="quantity-display">{quantity}</span>
                    <button 
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= book.stock}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="book-description">
              <h3>图书简介</h3>
              <p>{book.description || '暂无简介'}</p>
            </div>

            <div className="book-actions">
              <button 
                className={`add-to-cart-btn ${outOfStock ? 'disabled' : ''}`}
                onClick={handleAddToCart}
                disabled={outOfStock}
              >
                {outOfStock ? '暂时缺货' : `🛒 加入购物车 (${quantity})`}
              </button>
              <button 
                className={`buy-now-btn ${outOfStock ? 'disabled' : ''}`}
                onClick={handleBuyNow}
                disabled={outOfStock}
              >
                {outOfStock ? '暂时缺货' : '立即购买'}
              </button>
            </div>

            <div className="book-meta">
              <div className="meta-item">
                <span className="meta-label">ISBN：</span>
                <span className="meta-value">{book.isbn || '暂无'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">出版社：</span>
                <span className="meta-value">{book.publisher || '暂无'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">出版日期：</span>
                <span className="meta-value">{book.publish_date || '暂无'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">页数：</span>
                <span className="meta-value">{book.pages ? `${book.pages}页` : '暂无'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">语言：</span>
                <span className="meta-value">{book.language || '中文'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">装帧：</span>
                <span className="meta-value">{book.format || '平装'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage; 