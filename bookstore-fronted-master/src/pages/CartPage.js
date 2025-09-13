import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, getTotalItems, getTotalPrice } = useCart();
  const { user } = useUser();

  // 缓存默认图片URL，避免重复请求
  const defaultImageUrl = useMemo(() => 'https://via.placeholder.com/80x80/4A90E2/FFFFFF?text=📚', []);

  const handleQuantityChange = (bookId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(bookId);
    } else {
      updateQuantity(bookId, newQuantity);
    }
  };

  const totalPrice = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <h2 className="cart-title">购物车</h2>
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <p className="empty-cart-text">购物车是空的</p>
            <p className="empty-cart-subtext">快去挑选心仪的图书吧！</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="breadcrumb">
          <span>首页</span>
          <span className="breadcrumb-separator">›</span>
          <span>购物车</span>
        </div>
        
        <div className="cart-content">
          <div className="cart-items">
            <div className="cart-header">
              <div className="select-all">
                <input type="checkbox" defaultChecked />
                <span>全选</span>
              </div>
              <div className="cart-columns">
                <span className="column-product">商品信息</span>
                <span className="column-price">单价</span>
                <span className="column-quantity">数量</span>
                <span className="column-subtotal">小计</span>
                <span className="column-action">操作</span>
              </div>
            </div>
            
            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-checkbox">
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="item-info">
                                      <div className="item-image">
                    <img 
                      src={item.imageUrl || defaultImageUrl} 
                      alt={item.title}
                      onError={(e) => {
                        if (e.target.src !== defaultImageUrl) {
                          e.target.src = defaultImageUrl;
                        }
                      }}
                    />
                  </div>
                    <div className="item-details">
                      <h4 className="item-title">{item.title}</h4>
                      <p className="item-author">{item.author}</p>
                    </div>
                  </div>
                  <div className="item-price">¥{item.currentPrice}</div>
                  <div className="item-quantity">
                    <button 
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                      className="quantity-input"
                    />
                    <button 
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="item-subtotal">¥{item.currentPrice * item.quantity}</div>
                  <div className="item-action">
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="order-summary">
            <h3 className="summary-title">订单信息</h3>
            <div className="summary-items">
              <div className="summary-item">
                <span>商品金额:</span>
                <span>¥{totalPrice}</span>
              </div>

              <div className="summary-item">
                <span>运费:</span>
                <span>免运费</span>
              </div>
              <div className="summary-total">
                <span>总计:</span>
                <span>¥{totalPrice}</span>
              </div>
            </div>
            <button 
              className="checkout-btn"
              onClick={() => {
                if (!user) {
                  alert('请先登录');
                  return;
                }
                navigate('/payment', { state: { cartItems: items } });
              }}
            >
              去结算 ({getTotalItems()}件)
            </button>
            <p className="summary-note">
              已选择{items.length}件商品,总计{getTotalItems()}本
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 