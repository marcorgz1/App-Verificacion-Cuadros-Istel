import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

import UsersIcon from '../icons/UsersIcon.jsx';
import LockIcon from '../icons/LockIcon.jsx';

const AdminLoginForm = ({ onLogin }) => {
  const [nombreAdmin, setNombreAdmin] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/admin-login', { nombre_admin: nombreAdmin, contraseña });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        onLogin(response.data.token, true, nombreAdmin); // Pasar nombre del admin
        navigate('/admin-home'); // Redirigir a la página de inicio del administrador
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setError('Login incorrecto');
    }
  };

  return (
    <div className="login-body">
      <main className='login-main'>
        <div className="container-img">
          <img src="src/assets/logo-istel.png" />
        </div>
        <form className="form-is" onSubmit={handleSubmit}>          
          <div className="container-form1">
            <h2 id="txt-t">ADMINISTRADOR</h2>
          </div>
          <div className="container-form2">
            <div className="container-input">
              <div className="i-f">
                <input type="text" className='i-is' placeholder='Nombre Admin' value={nombreAdmin} onChange={(e) => setNombreAdmin(e.target.value)} />
                <UsersIcon className="icon" />
              </div>
              <div className="i-f">
                <input type="password" className='i-is' placeholder='Contraseña' value={contraseña} onChange={(e) => setContraseña(e.target.value)} />
                <LockIcon className="icon" />
              </div>
              <br />
              <Link to="/">Login de Usuario</Link>
            </div>
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <br />
          <button id='btn-conectar' type="submit">CONECTAR</button>
          <div className="container-form4">
            <p className="txt-p">Desarrollado por iSTEL</p>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AdminLoginForm;
