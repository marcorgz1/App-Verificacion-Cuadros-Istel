import { useState } from 'react'

const CrearClienteForm = () => {
    const [nombreCliente, setNombreCliente] = useState('')

    const handleInputChange = (event) => {
        setNombreCliente(event.target.value)
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        fetch('http://localhost:3000/clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre_cliente: nombreCliente })
        })
            .then(response => response.json())                    
            .then(data => {
                console.log('Cliente Creado: ', data)

                setNombreCliente('')
            })
            .catch(error => {
                console.error('Error al crear el cliente introducido:', error)
            })
    }
    return (
        <main className="crear-cliente-main">
            <section className="crear-cliente">
                <h2>Crear Cliente</h2>
                <br />
                <form onSubmit={handleSubmit}>
                    <label htmlFor="nomCliente">Nombre:</label>
                    <input type="text" value={nombreCliente} onChange={handleInputChange} required />
                    <br />
                    <button type="submit" id="btn-crear-cliente">Crear Cliente</button>
                </form>
            </section>
        </main>
    )
}

export default CrearClienteForm;