import { useState } from 'react'

const CrearClienteForm = () => {
    const [nombreCliente, setNombreCliente] = useState('')
    const [clienteAgregado, setClienteAgregado] = useState('')

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
                setClienteAgregado('El nuevo cliente se agregó correctamente')
            })
            .catch(error => {
                console.error('Error al crear el nuevo cliente:', error)
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
                    <div className='buttons-wrapper'>
                        <button type="submit" id="btn-crear-cliente">Crear Cliente</button>
                        <button id='btn-volver'>
                            <a href="/clientes">Volver</a>
                        </button>
                    </div>
                </form>
                {clienteAgregado &&
                    <p>{clienteAgregado}</p>
                }
            </section>
        </main>
    )
}

export default CrearClienteForm;