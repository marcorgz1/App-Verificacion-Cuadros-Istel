import { useState, useEffect } from "react";

const UsuariosForm = () => {
    const [usuarios, setusuarios] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/usuarios')
            .then(response => response.json())
            .then(data => {
                console.log(data)
                setusuarios(data)
            })
    }, []);
  return (
    <main className="usuarios-main">
      <section className="listado-usuarios">
        <div className="buttons-wrapper">
          <button id="btn-volver">
              <a href="/dashboard">Volver</a>
          </button>
          <button>
            <a href="/usuarios/crear-usuario">Crear Usuario</a>
          </button>
        </div>
        <br />
        <h1>Listado usuarios</h1>
        {usuarios.map((usuario, index) => (
          <section key={usuario.id} className="info-usuario">
            <p>Id: {usuario.id}</p>
            <p>Nombre: {usuario.nombre_usuario}</p>
            <p>Clave Secreta: {usuario.clave_secreta}</p>
            <p>Recuerdame: {usuario.recuerdame}</p>
            {/* Comprobar si el elemento actual de la lista es el último de la misma, si no lo es imprimir elemento "hr",
                        si lo es, no imprimirlo */}
            {/* index !== usuarios.length -1: Comprobar si el elemento actual es el último */}
            {index !== usuarios.length - 1 && <hr />}
          </section>
        ))}        
      </section>
    </main>
  );
};

export default UsuariosForm;