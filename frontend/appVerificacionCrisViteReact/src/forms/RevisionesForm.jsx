import { useState, useEffect } from "react";

const RevisionesForm = () => {
    const [revisiones, setRevisiones] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/requisitos')
            .then(response => response.json())
            .then(data => {
                console.log(data)
                setRevisiones(data)
            })
    }, []);
  return (
    <main className="revisiones-main">
      <section className="listado-revisiones">
        <button>
            <a href="/dashboard">Volver</a>
        </button>
        <h1>Listado Revisiones</h1>
        {revisiones.map((revision, index) => (
          <section key={revision.id} className="info-revision">
            <p>Id: {revision.id}</p>
            <p>Nombre: {revision.nombre_requisito}</p>
            <p>Id Modelo: {revision.id_modelo}</p>
            {/* Comprobar si el elemento actual de la lista es el último de la misma, si no lo es imprimir elemento "hr",
                        si lo es, no imprimirlo */}
            {/* index !== revisiones.length -1: Comprobar si el elemento actual es el último */}
            {index !== revision.length - 1 && <hr />}
          </section>
        ))}
        <button>
          <a href="/revisiones/crear-revision">Crear Revisión</a>
        </button>
      </section>
    </main>
  );
};

export default RevisionesForm;