import React from 'react';
import BookCard from './BookCard';
import './BookGrid.css';

const BookGrid = ({ books = [] }) => {
  if (!books || books.length === 0) {
    return (
      <div className="book-grid">
        <div className="no-books">
          <p>暂无书籍数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="book-grid">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
};

export default BookGrid; 