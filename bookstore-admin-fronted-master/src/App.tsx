import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import './App.css';

// 导入页面组件
import Layout from './components/Layout';
import Login from './pages/Login';
import BookList from './pages/BookList';
import BookEdit from './pages/BookEdit';
import CategoryList from './pages/CategoryList';
import UserList from './pages/UserList';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="books" element={<BookList />} />
              <Route path="books/edit/:id" element={<BookEdit />} />
              <Route path="books/create" element={<BookEdit />} />
              <Route path="categories" element={<CategoryList />} />
              <Route path="users" element={<UserList />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App; 