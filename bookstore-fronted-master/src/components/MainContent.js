import React, { useState, useEffect } from 'react';
import BookGrid from './BookGrid';
import RightSidebar from './RightSidebar';
import './MainContent.css';

const MainContent = () => {
  const [books, setBooks] = useState([]);
  const [hotBooks, setHotBooks] = useState([]);
  const [newBooks, setNewBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBooks(currentPage);
    fetchHotBooks();
    fetchNewBooks();
  }, [currentPage]);

  const fetchBooks = async (page = 1) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/book/list?page=${page}&page_size=12`);
      const data = await response.json();
      
      if (data.code === 0) {
        setBooks(data.data.books);
        setTotalPages(data.data.total_page);
      } else {
        setError('获取书籍列表失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchHotBooks = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/book/hot');
      const data = await response.json();
      
      if (data.code === 0) {
        setHotBooks(data.data);
      }
    } catch (err) {
      console.error('获取热销书籍失败:', err);
    }
  };

  const fetchNewBooks = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/book/new');
      const data = await response.json();
      
      if (data.code === 0) {
        setNewBooks(data.data);
      }
    } catch (err) {
      console.error('获取新书失败:', err);
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在加载书籍...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
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
    <div className="main-content">
      <div className="main-container">
        <div className="center-section">
          <div className="book-section">
            <h3 className="section-title">精选图书</h3>
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
          </div>
        </div>
        <RightSidebar hotBooks={hotBooks} newBooks={newBooks} />
      </div>
    </div>
  );
};

export default MainContent; 