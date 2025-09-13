import React, { createContext, useContext, useState, useCallback } from 'react';
import { useUser } from './UserContext';

const FavoriteContext = createContext();

export const FavoriteProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  // 检查书籍是否已收藏
  const checkFavorite = useCallback(async (bookId) => {
    if (!user) return false;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/v1/favorite/${bookId}/check`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.code === 0 && data.data.is_favorited;
      }
    } catch (error) {
      console.error('检查收藏状态失败:', error);
    }
    return false;
  }, [user]);

  // 添加收藏
  const addFavorite = useCallback(async (bookId) => {
    if (!user) {
      alert('请先登录');
      return false;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/v1/favorite/${bookId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.code === 0) {
        setFavoriteCount(prev => prev + 1);
        return true;
      } else {
        alert(data.message || '添加收藏失败');
        return false;
      }
    } catch (error) {
      console.error('添加收藏失败:', error);
      alert('网络错误，请稍后重试');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 取消收藏
  const removeFavorite = useCallback(async (bookId) => {
    if (!user) return false;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/v1/favorite/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.code === 0) {
        setFavoriteCount(prev => Math.max(0, prev - 1));
        setFavorites(prev => prev.filter(fav => fav.book_id !== bookId));
        return true;
      } else {
        alert(data.message || '取消收藏失败');
        return false;
      }
    } catch (error) {
      console.error('取消收藏失败:', error);
      alert('网络错误，请稍后重试');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 获取收藏列表
  const fetchFavorites = useCallback(async (page = 1, timeFilter = 'all') => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/v1/favorite/list?page=${page}&time_filter=${timeFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.code === 0) {
        setFavorites(data.data.favorites);
        return data.data;
      }
    } catch (error) {
      console.error('获取收藏列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 获取收藏数量
  const fetchFavoriteCount = useCallback(async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/favorite/count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.code === 0) {
        setFavoriteCount(data.data.count);
      }
    } catch (error) {
      console.error('获取收藏数量失败:', error);
    }
  }, [user]);

  const value = {
    favorites,
    favoriteCount,
    loading,
    checkFavorite,
    addFavorite,
    removeFavorite,
    fetchFavorites,
    fetchFavoriteCount
  };

  return (
    <FavoriteContext.Provider value={value}>
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorite = () => {
  return useContext(FavoriteContext);
}; 