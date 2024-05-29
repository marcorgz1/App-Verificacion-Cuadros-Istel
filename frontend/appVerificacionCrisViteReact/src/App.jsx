import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (token, recuerdame) => {
    setIsAuthenticated(true);
    if (recuerdame) {
      localStorage.setItem('token', token);
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/home" element={isAuthenticated ? <HomePage /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
