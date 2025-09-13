import React, { useState, useEffect, useCallback } from 'react';
import { useFavorite } from '../contexts/FavoriteContext';
import BookGrid from '../components/BookGrid';
import './FavoritePage.css';

const FavoritePage = () => {
  const { favorites, loading, fetchFavorites } = useFavorite();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [timeFilter, setTimeFilter] = useState('all');
  const [totalCount, setTotalCount] = useState(0);

  const loadFavorites = useCallback(async () => {
    const data = await fetchFavorites(currentPage, timeFilter);
    if (data) {
      setTotalPages(data.total_pages);
      setTotalCount(data.total);
    }
  }, [currentPage, timeFilter, fetchFavorites]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
    setCurrentPage(1);
  };

  const timeFilterOptions = [
    { value: 'all', label: '全部' },
    { value: 'today', label: '今天' },
    { value: 'week', label: '本周' },
    { value: 'month', label: '本月' },
    { value: 'year', label: '今年' }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="favorite-page">
      <div className="favorite-header">
        <div className="favorite-title">
          <h1>我的收藏</h1>
          <p>共收藏了 {totalCount} 本书</p>
        </div>
        
        <div className="filter-section">
          <div className="time-filter">
            <span className="filter-label">时间筛选：</span>
            <div className="filter-buttons">
              {timeFilterOptions.map(option => (
                <button
                  key={option.value}
                  className={`filter-btn ${timeFilter === option.value ? 'active' : ''}`}
                  onClick={() => handleTimeFilterChange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="favorite-content">
        {favorites.length > 0 ? (
          <>
            <BookGrid books={favorites.map(fav => fav.book)} />
            
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="pagination-btn" 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ‹
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    {currentPage > 3 && <span className="pagination-ellipsis">...</span>}
                    {currentPage > 3 && currentPage < totalPages - 2 && (
                      <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage)}
                      >
                        {currentPage}
                      </button>
                    )}
                    {currentPage < totalPages - 2 && <span className="pagination-ellipsis">...</span>}
                    {currentPage < totalPages - 2 && (
                      <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </button>
                    )}
                  </>
                )}
                <button 
                  className="pagination-btn" 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  ›
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">❤️</div>
            <h3 className="empty-title">暂无收藏</h3>
            <p className="empty-description">
              您还没有收藏任何书籍，快去首页发现好书吧！
            </p>
            <button onClick={() => window.location.href = '/'} className="back-to-home-btn">
              去首页
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritePage; 