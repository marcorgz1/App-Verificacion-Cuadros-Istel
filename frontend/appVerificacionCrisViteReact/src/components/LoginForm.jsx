import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from 'react-router-dom';

import LockIcon from "../icons/LockIcon.jsx";
import UsersIcon from "../icons/UsersIcon.jsx";

const LoginForm = ({ onLogin }) => {
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [claveSecreta, setClaveSecreta] = useState("");
  const [recuerdame, setRecuerdame] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3001/login", {
        nombre_usuario: nombreUsuario,
        clave_secreta: claveSecreta,
      });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        onLogin(response.data.token, recuerdame);
        navigate("/home"); // Redirigir a la página de verificación de productos
      }
    } catch (error) {
      console.error("Login error:", error); // Log para errores en el frontend
      alert("Login failed");
    }
  };

  return (
    <div className="login-body">
      <main className="login-main">
        <div className="container-img">
          <img src="src/assets/logo-istel.png" />
        </div>
        <form className="form-is" onSubmit={handleSubmit}>
          <div className="container-form1">
            <h2 id="txt-t">INICIAR SESIÓN</h2>
          </div>
          <div className="container-form2">
            <div id="container-input">
              <div className="i-f">
                <input
                  type="text"
                  className="i-is"
                  placeholder="Nombre Usuario"
                  value={nombreUsuario}
                  onChange={(e) => setNombreUsuario(e.target.value)}
                />
                <UsersIcon className="icon" />
              </div>
            </div>
            <div className="i-f">
              <input
                type="password"
                className="i-is"
                value={claveSecreta}
                onChange={(e) => setClaveSecreta(e.target.value)}
                placeholder="Clave Secreta"
              />
              <LockIcon className="icon" />
            </div>
            <div className="remember-wrapper">
              <div id="container-check">
                <input
                  type="checkbox"
                  id="i-ch"
                  checked={recuerdame}
                  onChange={(e) => setRecuerdame(e.target.checked)}
                />
                <span className="txt-p">Recuérdame</span>
              </div>
              <Link to="/admin-login">Login de Administrador</Link>
            </div>
          </div>
          <div className="container-form3">
            <button type="submit" id="btn-conectar">
              CONECTAR
            </button>
          </div>
          <div className="container-form4">
            <p className="txt-p">Desarrollado por iSTEL</p>
          </div>
        </form>
      </main>
    </div>
  );
};

export default LoginForm;
