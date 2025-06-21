import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import Clock from './components/Clock'; // Import đồng hồ
import './App.css';

const Navbar = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
    window.location.reload(); 
  };

  return (
    <div className="navbar">
      <h1><Link to="/">Quản Lý Chi Tiêu</Link></h1>
      <Clock />
      <div className="nav-links">
        {userInfo ? (
          <>
            <span className="nav-user">Chào, {userInfo.name}!</span>
            <button onClick={handleLogout} className="btn-logout">Đăng xuất</button>
          </>
        ) : (
          <>
            <Link to="/login">Đăng nhập</Link>
            <Link to="/register">Đăng ký</Link>
          </>
        )}
      </div>
    </div>
  );
};

function App() {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={userInfo ? <DashboardPage /> : <LoginPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;