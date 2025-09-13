import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import BookCard from '../components/BookCard';
import './SearchPage.css';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q');
  
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (query) {
      fetchSearchResults();
    }
  }, [query, currentPage]);

  const fetchSearchResults = async () => {
    if (!query) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/book/search?q=${encodeURIComponent(query)}&page=${currentPage}&page_size=12`
      );
      const data = await response.json();

      if (data.code === 0) {
        setBooks(data.data.books || []);
        setTotalPages(data.data.total_page || 1);
      } else {
        setError(data.message || '搜索失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (!query) {
    return (
      <div className="search-page">
        <div className="search-container">
          <div className="no-query">
            <div className="no-query-icon">🔍</div>
            <h2>请输入搜索关键词</h2>
            <p>搜索书籍名称或作者</p>
            <button onClick={() => navigate('/')} className="back-home-btn">
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-page">
      <div className="search-container">
        <div className="search-header">
          <div className="breadcrumb">
            <span onClick={() => navigate('/')} className="breadcrumb-link">首页</span>
            <span className="breadcrumb-separator">›</span>
            <span>搜索结果</span>
          </div>
          
          <div className="search-info">
            <h2>搜索结果</h2>
            <p className="search-query">关键词："{query}"</p>
            {!loading && (
              <p className="search-count">
                找到 {books.length} 本相关图书
                {totalPages > 1 && `，共 ${totalPages} 页`}
              </p>
            )}
          </div>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>正在搜索...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={fetchSearchResults} className="retry-btn">
              重试
            </button>
          </div>
        )}

        {!loading && !error && books.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">📚</div>
            <h3>没有找到相关图书</h3>
            <p>请尝试其他关键词</p>
            <div className="suggestions">
              <p>搜索建议：</p>
              <ul>
                <li>检查关键词拼写</li>
                <li>尝试更简单的关键词</li>
                <li>使用作者姓名搜索</li>
              </ul>
            </div>
          </div>
        )}

        {!loading && !error && books.length > 0 && (
          <>
            <div className="search-results">
              <div className="books-grid">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  上一页
                </button>
                
                <div className="page-numbers">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage; 