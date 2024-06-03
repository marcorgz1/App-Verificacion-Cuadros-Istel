import { useState, useEffect } from 'react';

const AdminsForm = () => {
    const [admins, setAdmins] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/administradores')
            .then(response => response.json())
            .then(data => {
                console.log(data)
                setAdmins(data)
            })
    }, []);

    return (
        <main className="admins-main">
            <section className="listado-admins">
                <h1>Listado Admins</h1>
                <div className="buttons-wrapper">
                    <button id="btn-volver">
                        <a href="/dashboard">Volver</a>
                    </button>
                    <button>
                        <a href="/admins/crear-cliente">Crear Admin</a>
                    </button>
                </div>
                <br />
                {admins.map((admin, index) => (
                    <section key={admin.id} className="info-admin">
                        <p>Id: {admin.id}</p>
                        <p>Nombre: {admin.nombre_admin}</p>
                        {/* Comprobar si el elemento actual de la lista es el último de la misma, si no lo es imprimir elemento "hr",
                        si lo es, no imprimirlo */}
                        {/* index !== admins.length -1: Comprobar si el elemento actual es el último */}
                        {index !== admins.length - 1 && <hr />}
                    </section>
                ))}            
            </section>
        </main>
    )
}

export default AdminsForm;