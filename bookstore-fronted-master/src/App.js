import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { CartProvider } from './contexts/CartContext';
import { UserProvider } from './contexts/UserContext';
import { CartAnimationProvider } from './contexts/CartAnimationContext';
import { FavoriteProvider } from './contexts/FavoriteContext';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryButtons from './components/CategoryButtons';
import MainContent from './components/MainContent';
import CartPage from './pages/CartPage';
import PaymentPage from './pages/PaymentPage';
import SearchPage from './pages/SearchPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ProfilePage from './pages/ProfilePage';
import BookDetailPage from './pages/BookDetailPage';
import CategoryPage from './pages/CategoryPage';
import FavoritePage from './pages/FavoritePage';
import Footer from './components/Footer';

function HomePage() {
  return (
    <>
      <Hero />
      <CategoryButtons />
      <MainContent />
    </>
  );
}

function App() {
  return (
    <UserProvider>
    <CartProvider>
        <CartAnimationProvider>
          <FavoriteProvider>
            <Router>
              <div className="App">
                <Header />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/cart" element={<CartPage />} />
                          <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/:orderId" element={<PaymentPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/book/:id" element={<BookDetailPage />} />
                  <Route path="/category/:category" element={<CategoryPage />} />
                  <Route path="/favorites" element={<FavoritePage />} />
                </Routes>
                <Footer />
              </div>
            </Router>
          </FavoriteProvider>
        </CartAnimationProvider>
    </CartProvider>
    </UserProvider>
  );
}

export default App; 