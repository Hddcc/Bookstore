import React from 'react';
import './RightSidebar.css';
import { Link } from 'react-router-dom';

const RightSidebar = ({ hotBooks = [], newBooks = [] }) => {
  return (
    <div className="right-sidebar">
      <div className="hot-books-section">
        <div className="section-header">
          <div className="section-icon">🔥</div>
          <h3>热销榜</h3>
          <div className="section-decoration"></div>
        </div>
        <div className="hot-books-list">
          {hotBooks.map((book, index) => (
               <Link to={`/book/${book.id}`} key={book.id} className="hot-book-item" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="rank-badge">
                <span className="rank-number">{index + 1}</span>
                {index < 3 && <div className="crown-icon">👑</div>}
              </div>
              <div className="hot-book-info">
                <h4 className="hot-book-title">{book.title}</h4>
                <p className="hot-book-author">{book.author}</p>
                <div className="price-section">
                  <span className="hot-book-price">¥{book.price}</span>
                  <span className="sales-badge">热销</span>
                </div>
              </div>
              <div className="book-cover">
                <img src={book.cover_url || 'https://via.placeholder.com/40x50/ff6b6b/ffffff?text=📚'} alt={book.title} />
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="new-books-section">
        <div className="section-header">
          <div className="section-icon">✨</div>
          <h3>新书上架</h3>
          <div className="section-decoration"></div>
        </div>
        <div className="new-books-list">
          {newBooks.map((book, index) => (
            <Link to={`/book/${book.id}`} key={book.id} className="new-book-item" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="rank-badge new">
                <span className="rank-number">{index + 1}</span>
                <div className="new-badge">NEW</div>
              </div>
              <div className="new-book-info">
                <h4 className="new-book-title">{book.title}</h4>
                <p className="new-book-author">{book.author}</p>
                <div className="price-section">
                  <span className="new-book-price">¥{book.price}</span>
                  <span className="new-badge-small">新书</span>
                </div>
              </div>
              <div className="book-cover">
                <img src={book.cover_url || 'https://via.placeholder.com/40x50/4ecdc4/ffffff?text=📚'} alt={book.title} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar; 