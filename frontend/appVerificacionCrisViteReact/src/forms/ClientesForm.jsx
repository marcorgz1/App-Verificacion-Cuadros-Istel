import { useState, useEffect } from "react";

const ClientesForm = () => {
    const [clientes, setClientes] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3001/clientes')
            .then(response => response.json())
            .then(data => {
                console.log(data)
                setClientes(data)
            })
    }, []);

    return (
        <main className="clientes-main">
            <section className="listado-clientes">
                <h1>Listado Clientes</h1>
                <div className="buttons-wrapper">
                    <button id="btn-volver">
                        <a href="/dashboard">Volver</a>
                    </button>
                    <button>
                        <a href="/clientes/crear-cliente">Crear Cliente</a>
                    </button>
                </div>
                <br />
                {clientes.map((cliente, index) => (
                    <section key={cliente.id} className="info-cliente">
                        <p>Id: {cliente.id}</p>
                        <p>Nombre: {cliente.nombre_cliente}</p>
                        {/* Comprobar si el elemento actual de la lista es el último de la misma, si no lo es imprimir elemento "hr",
                        si lo es, no imprimirlo */}
                        {/* index !== clientes.length -1: Comprobar si el elemento actual es el último */}
                        {index !== clientes.length - 1 && <hr />}
                    </section>
                ))}            
            </section>
        </main>
    )
}

export default ClientesForm;