import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginAdminPage from './pages/LoginAdminPage.jsx';

// Páginas
import { AdminPage } from './pages/AdminPage.jsx';
import { ClientesPage } from './pages/ClientesPage.jsx';
import { CrearClientePage } from './pages/CrearClientePage.jsx';
import { ModelosPage } from './pages/ModelosPage.jsx';
import { RevisionesPage } from './pages/RevisionesPage.jsx';
import { UsuariosPage } from './pages/UsuariosPage.jsx';
import { VerificacionesPage } from './pages/VerificacionesPage.jsx';

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
        <Route path="/admin" element={<LoginAdminPage onLogin={handleLogin} />} />
        <Route path="/dashboard" element={<AdminPage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/clientes/crear-cliente" element={<CrearClientePage />} />
        <Route path="/modelos" element={<ModelosPage />} />
        <Route path="/revisiones" element={<RevisionesPage />} />
        <Route path="/usuarios" element={<UsuariosPage />} />
        <Route path="/verificaciones" element={<VerificacionesPage />} />
      </Routes>
    </Router>
  );
};

export default App;
