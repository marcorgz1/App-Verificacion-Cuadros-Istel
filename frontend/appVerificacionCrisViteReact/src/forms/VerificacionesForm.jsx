import { useState, useEffect } from "react";

const VerificacionesForm = () => {
    const [verificaciones, setVerificaciones] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/verificaciones')
            .then(response => response.json())
            .then(data => {
                console.log(data)
                setVerificaciones(data)
            })
    }, []);

    return (
        <main className="verificaciones-main">
            <section className="listado-verificaciones">
                <h1>Listado verificaciones</h1>
                <div className="buttons-wrapper">
                    <button id="btn-volver">
                        <a href="/dashboard">Volver</a>
                    </button>
                    <button>
                        <a href="#">Crear Verficación</a>
                    </button>
                </div>
                <br />
                {verificaciones.map((verificacion, index) => (
                    <section key={verificacion.id} className="info-verificacion">
                        <p>Id: {verificacion.id}</p>
                        <p>Id Usuario: {verificacion.id_usuario}</p>
                        <p>Id Cliente: {verificacion.id_cliente}</p>
                        <p>Id Modelo: {verificacion.id_modelo}</p>
                        {/* <p>Nº Cuadro: {verificacion.numero_cuadro}</p>
                        <p>Nº Interruptor: {verificacion.numero_interruptor}</p>
                        <p>Nº Cliente: {verificacion.numero_cliente}</p> */}
                        <p>Requisitos Cumplidos: {verificacion.requisitos_cumplidos}</p>
                        <p>Imágenes: {verificacion.imagenes}</p>
                        <p>Fecha: {verificacion.fecha}</p>
                        {/* Comprobar si el elemento actual de la lista es el último de la misma, si no lo es imprimir elemento "hr",
                        si lo es, no imprimirlo */}
                        {/* index !== verificaciones.length -1: Comprobar si el elemento actual es el último */}
                        {index !== verificaciones.length - 1 && <hr />}
                    </section>
                ))}
            </section>
        </main>
    )
}

export default VerificacionesForm;