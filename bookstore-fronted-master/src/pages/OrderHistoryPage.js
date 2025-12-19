import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import './OrderHistoryPage.css';

const OrderHistoryPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('OrderHistoryPage: useEffect triggered');
    console.log('User:', user);

    if (!user) {
      console.log('OrderHistoryPage: No user, redirecting to home');
      navigate('/');
      return;
    }

    console.log('OrderHistoryPage: Fetching orders...');
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      console.log('OrderHistoryPage: Starting fetchOrders');
      const token = localStorage.getItem('token');
      console.log('OrderHistoryPage: Token exists:', !!token);

      const response = await fetch('http://localhost:8080/api/v1/order/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('OrderHistoryPage: Response status:', response.status);
      const data = await response.json();
      console.log('OrderHistoryPage: Response data:', data);

      if (data.code === 0) {
        console.log('OrderHistoryPage: API success, data.data type:', typeof data.data);
        console.log('OrderHistoryPage: data.data:', data.data);

        // 处理后端返回的数据格式
        let ordersArray = [];
        if (data.data && data.data.orders) {
          // 后端返回的是 { orders: [...], total: 10, ... } 格式
          ordersArray = Array.isArray(data.data.orders) ? data.data.orders : [];
        } else if (Array.isArray(data.data)) {
          // 后端直接返回数组格式
          ordersArray = data.data;
        }

        setOrders(ordersArray);
        console.log('OrderHistoryPage: Orders set:', ordersArray.length);
      } else {
        setError(data.message || '获取订单失败');
        console.log('OrderHistoryPage: Error set:', data.message);
      }
    } catch (error) {
      console.error('OrderHistoryPage: Fetch error:', error);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
      console.log('OrderHistoryPage: Loading set to false');
    }
  };

  // [新增] 取消订单处理函数
  const handleCancelOrder = async (orderId) => {
    // 弹窗确认
    if (!window.confirm('确认要取消该订单吗？')) return;

    try {
      const token = localStorage.getItem('token');
      // 调用后端 API
      const response = await fetch(`http://localhost:8080/api/v1/order/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.code === 0) {
        alert('订单已取消');
        // 重新获取列表以更新状态
        fetchOrders();
      } else {
        alert(data.message || '取消失败');
      }
    } catch (err) {
      console.error(err);
      alert('网络错误');
    }
  };


  const getStatusText = (status) => {
    const statusMap = {
      0: { text: '待支付', color: '#FF6B6B' },
      1: { text: '已支付', color: '#4ECDC4' },
      2: { text: '已取消', color: '#95A5A6' }
    };
    return statusMap[status] || { text: '未知状态', color: '#95A5A6' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  const formatPrice = (priceInYuan) => {
    return priceInYuan;
  };

  console.log('OrderHistoryPage: Rendering with user:', user, 'loading:', loading, 'error:', error, 'orders type:', typeof orders, 'orders length:', Array.isArray(orders) ? orders.length : 'not array');

  if (!user) {
    console.log('OrderHistoryPage: No user, returning null');
    return null;
  }

  if (loading) {
    console.log('OrderHistoryPage: Loading state');
    return (
      <div className="order-history-page">
        <div className="order-history-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>加载订单中...</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('OrderHistoryPage: Main render');
  return (
    <div className="order-history-page">
      <div className="order-history-container">
        <div className="page-header">
          <h1>我的订单</h1>
          <p>查看您的所有订单记录</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!Array.isArray(orders) || orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>暂无订单</h3>
            <p>您还没有任何订单记录</p>
            <button
              className="browse-books-btn"
              onClick={() => navigate('/')}
            >
              去浏览图书
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const statusInfo = getStatusText(order.status);
              return (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h3>订单号: {order.order_no}</h3>
                      <p className="order-date">下单时间: {formatDate(order.created_at)}</p>
                    </div>
                    <div
                      className="order-status"
                      style={{ backgroundColor: statusInfo.color }}
                    >
                      {statusInfo.text}
                    </div>
                  </div>

                  <div className="order-items">
                    {order.order_items && order.order_items.map((item) => (
                      <div key={item.id} className="order-item">
                        <div className="item-image">
                          <img
                            src={item.book?.cover_url || 'https://via.placeholder.com/60x80/4A90E2/FFFFFF?text=📚'}
                            alt={item.book?.title}
                          />
                        </div>
                        <div className="item-info">
                          <h4>{item.book?.title}</h4>
                          <p className="item-author">{item.book?.author}</p>
                          <p className="item-quantity">数量: {item.quantity}</p>
                        </div>
                        <div className="item-price">
                          <span className="price">¥{formatPrice(item.price)}</span>
                          <span className="subtotal">小计: ¥{formatPrice(item.subtotal)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <div className="order-total">
                      <span>总计: </span>
                      <span className="total-price">¥{formatPrice(order.total_amount)}</span>
                    </div>

                    {/* [新增] 按钮组：包含取消订单和去支付 */}
                    {order.status == 0 && (
                      <div className="action-buttons" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          className="cancel-btn"
                          style={{
                            padding: '8px 20px',  // 统一内边距
                            fontSize: '14px',     // 统一字体
                            height: '36px',       // 统一高度
                            backgroundColor: '#95a5a6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          取消订单
                        </button>

                        <button
                          className="pay-now-btn"
                          style={{
                            padding: '8px 20px',  // 统一内边距
                            fontSize: '14px',     // 统一字体
                            height: '36px',       // 统一高度
                            backgroundColor: '#FF6B6B',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onClick={() => navigate(`/payment/${order.id}`)}
                        >
                          去支付
                        </button>
                      </div>
                    )}

                    {order.is_paid && order.payment_time && (
                      <p className="payment-time">
                        支付时间: {formatDate(order.payment_time)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage; 