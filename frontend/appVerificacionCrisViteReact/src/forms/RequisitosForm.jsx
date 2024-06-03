import { useState, useEffect } from 'react';

const Revisiones = () => {
  const [revisiones, setRevisiones] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/requisitos')
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setRevisiones(data);
      });
  }, []);

  return (
    <main className="revisiones-main">
      <section className="listado-revisiones">
        <h1>Listado Requisitos</h1>
        <div className="buttons-wrapper">
          <button id="btn-volver">
            <a href="/dashboard">Volver</a>
          </button>
          <button>
            <a href="/requisitos/crear-requisito">Crear Requisito</a>
          </button>
        </div>
        <br />
        {revisiones.map((revision, index) => (
          <section key={revision.id} className="info-revision">
            <p>Id: {revision.id}</p>
            <p>Nombre: {revision.nombre_requisito}</p>
            <p>Id Modelo: {revision.id_modelo}</p>
            {/* Comprobar si el elemento actual de la lista es el último de la misma, si no lo es imprimir elemento "hr",
                        si lo es, no imprimirlo */}
            {/* index !== revisiones.length -1: Comprobar si el elemento actual es el último */}
            {index !== revisiones.length - 1 && <hr />}
          </section>
        ))}
      </section>
    </main>
  );
};

export default Revisiones;
