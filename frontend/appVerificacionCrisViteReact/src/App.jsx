import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AdminLoginForm from './components/AdminLoginForm';
import AdminHome from './components/AdminHome';
import AdminTable from './components/AdminTable';
import EditForm from './components/EditForm';
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      const storedAdminName = localStorage.getItem('adminName');
      if (storedAdminName) {
        setAdminName(storedAdminName);
      }
    }
  }, []);

  const handleLogin = (token, recuerdame, nombre_admin) => {
    setIsAuthenticated(true);
    if (recuerdame) {
      localStorage.setItem('token', token);
      if (nombre_admin) {
        localStorage.setItem('adminName', nombre_admin); // Guardar el nombre del admin en el localStorage
      }
    }
    if (nombre_admin) {
      setAdminName(nombre_admin);
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/home" element={isAuthenticated ? <HomePage /> : <Navigate to="/" />} />
        <Route path="/admin-login" element={<AdminLoginForm onLogin={handleLogin} />} />
        <Route path="/admin-home" element={isAuthenticated ? <AdminHome adminName={adminName} /> : <Navigate to="/admin-login" />} />
        <Route path="/admin/:tableName/*" element={isAuthenticated ? <AdminTable /> : <Navigate to="/admin-login" />} />
        <Route path="/admin/:tableName/edit/:id" element={isAuthenticated ? <EditForm /> : <Navigate to="/admin-login" />} />
      </Routes>
    </Router>
  );
};

export default App;