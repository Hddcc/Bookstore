import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartAnimationContext } from '../contexts/CartAnimationContext';
import { useFavorite } from '../contexts/FavoriteContext';
import { useCart } from '../contexts/CartContext';
import './BookCard.css';

const BookCard = ({ book }) => {
  const navigate = useNavigate();
  const { triggerCartAnimation } = useContext(CartAnimationContext);
  const { checkFavorite, addFavorite, removeFavorite } = useFavorite();
  const { addToCart } = useCart();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // 计算折扣价格（价格以元为单位，折扣以百分比为单位）
  // 折扣是基于原价的折扣，例如：100元打10%折扣 = 90元
  const discountedPrice = book.discount > 0 
    ? Math.floor(book.price * (100 - book.discount) / 100)
    : book.price;
  const hasDiscount = book.discount > 0;
  
  // 检查是否缺货
  const outOfStock = book.stock <= 0;

  // 检查收藏状态
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const favorited = await checkFavorite(book.id);
      setIsFavorited(favorited);
    };
    checkFavoriteStatus();
  }, [book.id, checkFavorite]);

  const handleCardClick = () => {
    navigate(`/book/${book.id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation(); // 阻止事件冒泡
    if (!outOfStock) {
      // 获取按钮位置用于动画
      const rect = e.currentTarget.getBoundingClientRect();
      const startPosition = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      
      triggerCartAnimation(startPosition);
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
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation(); // 阻止事件冒泡
    setFavoriteLoading(true);
    
    try {
      if (isFavorited) {
        await removeFavorite(book.id);
        setIsFavorited(false);
      } else {
        await addFavorite(book.id);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <div className="book-card" onClick={handleCardClick}>
      <div className="book-image">
        <img 
          src={book.cover_url || 'https://via.placeholder.com/300x225/4A90E2/FFFFFF?text=📚'} 
          alt={book.title}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="book-emoji" style={{ display: 'none' }}>📚</div>
        {outOfStock && <div className="out-of-stock">缺货</div>}
        {hasDiscount && <div className="discount-badge">{book.discount}% OFF</div>}
        
        {/* 收藏按钮 */}
        <button 
          className={`favorite-btn ${isFavorited ? 'favorited' : ''} ${favoriteLoading ? 'loading' : ''}`}
          onClick={handleFavoriteClick}
          disabled={favoriteLoading}
        >
          {isFavorited ? '❤️' : '🤍'}
        </button>
      </div>
      
      <div className="book-info">
        <div className="book-title">{book.title}</div>
        <p className="book-author">{book.author}</p>
        <p className="book-type">{book.type}</p>
        
        <div className="book-price">
          <div className="price-info">
            {hasDiscount ? (
              <>
                <span className="current-price">¥{discountedPrice}</span>
                <span className="original-price">¥{book.price}</span>
              </>
            ) : (
              <span className="current-price">¥{book.price}</span>
            )}
          </div>
          <span className={`book-stock ${outOfStock ? 'out-of-stock-text' : 'in-stock'}`}>
            {outOfStock ? '缺货' : `库存:${book.stock}`}
          </span>
        </div>
        
        <button 
          className={`add-to-cart-btn ${outOfStock ? 'disabled' : ''}`}
          onClick={handleAddToCart}
          disabled={outOfStock}
        >
          {outOfStock ? '暂时缺货' : '🛒 加入购物车'}
        </button>
      </div>
    </div>
  );
};

export default BookCard; 