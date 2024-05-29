import { useState, useEffect } from "react";

const ModelosForm = () => {
    const [modelos, setModelos] = useState([])

    useEffect(() => {
        fetch('http://localhost:3000/modelos')
            .then(response => response.json())
            .then(data => {
                console.log(data)
                setModelos(data)
            })
    }, [])

    return (
        <main className="modelos-main">
            <section className="listado-modelos">
                <button>
                    <a href="/dashboard">Volver</a>
                </button>
                <h1>Listado Modelos</h1>
                {modelos.map((modelo, index) => (
                    <section key={modelo.id} className="info-modelo">
                        <p>Id: {modelo.id}</p>
                        <p>Nombre: {modelo.nombre_modelo}</p>
                        {/* Comprobar si el elemento actual de la lista es el último de la misma, si no lo es imprimir elemento "hr",
                        si lo es, no imprimirlo */}
                        {/* index !== clientes.length -1: Comprobar si el elemento actual es el último */}
                        {index !== modelo.length - 1 && <hr />}
                    </section>
                ))}
            <button>
                <a href="/modelos/crear-modelo">Crear Modelo</a>
            </button>
            </section>
        </main>
    )
}

export default ModelosForm;