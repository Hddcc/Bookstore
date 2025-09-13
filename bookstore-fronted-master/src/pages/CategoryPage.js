import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BookGrid from '../components/BookGrid';
import './CategoryPage.css';

const CategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCategoryBooks = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/book/category/${category}?page=${currentPage}&page_size=12`);
      const data = await response.json();
      
      if (data.code === 0) {
        setBooks(data.data || []);
        setTotalPages(Math.ceil((data.data?.length || 0) / 12));
      } else {
        setError('获取分类书籍失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [category, currentPage]);

  useEffect(() => {
    fetchCategoryBooks();
  }, [fetchCategoryBooks]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      '文学': '📚', '科幻': '🚀', '古典文学': '🏛️', '政治小说': '🏛️', '政治寓言': '🦁',
      '童话': '🧸', '科普': '🔬', '历史': '📜', '科技': '💻', '计算机': '💻', '其他': '📖'
    };
    return iconMap[categoryName] || '📖';
  };

  if (loading) {
    return (
      <div className="category-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在加载分类书籍...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="category-header">
        <div className="breadcrumb">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            ← 返回首页
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{category}</span>
        </div>
        
        <div className="category-info">
          <div className="category-icon">{getCategoryIcon(category)}</div>
          <div className="category-details">
            <h1 className="category-title">{category}</h1>
            <p className="category-description">
              发现更多精彩的{category}类图书
            </p>
            <p className="category-count">共 {books.length} 本图书</p>
          </div>
        </div>
      </div>

      <div className="category-content">
        {books.length > 0 ? (
          <>
            <BookGrid books={books} />
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
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3 className="empty-title">暂无{category}类图书</h3>
            <p className="empty-description">
              该分类下暂时没有图书，请稍后再来查看
            </p>
            <button onClick={() => navigate('/')} className="back-to-home-btn">
              返回首页
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage; 