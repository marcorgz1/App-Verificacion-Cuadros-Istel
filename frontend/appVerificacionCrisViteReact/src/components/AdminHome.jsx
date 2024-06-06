import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminHome = ({ adminName }) => {
  const navigate = useNavigate();
  const tables = ['clientes', 'modelos', 'requisitos', 'usuarios', 'verificaciones', 'administrador'];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminName');
    navigate('/admin-login');
  };

  return (
    <main className='admin-main'>
      <h1>MENU DE ADMINISTRADOR - {adminName}</h1>
        {tables.map((table) => (
          <button key={table} onClick={() => navigate(`/admin/${table}`)}>
            {table}
          </button>
        ))}
      <button className='btn-salir' onClick={handleLogout}>Salir</button>
    </main>
  );
};

export default AdminHome;
