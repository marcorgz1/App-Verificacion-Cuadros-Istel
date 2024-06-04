import { useState } from 'react'

const CrearModeloForm = () => {
    const [nombreModelo, setNombreModelo] = useState('')
    const [modeloAgregado, setModeloAgregado] = useState('')

    const handleInputChange = (event) => {
        setNombreModelo(event.target.value)
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        fetch('http://localhost:3001/modelos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre_modelo: nombreModelo })
        })
            .then(response => response.json())                    
            .then(data => {
                console.log('Modelo Creado: ', data)

                setNombreModelo('')
                setModeloAgregado('El nuevo modelo se agregó correctamente')
            })
            .catch(error => {
                console.error('Error al crear el modelo introducido:', error)
            })
    }
    return (
        <main className="crear-modelo-main">
            <section className="crear-modelo">
                <h2>Crear Modelo</h2>
                <br />
                <form onSubmit={handleSubmit}>
                    <label htmlFor="nomModelo">Nombre:</label>
                    <input type="text" value={nombreModelo} onChange={handleInputChange} required />
                    <br />                    
                    <div className='buttons-wrapper'>
                        <button type="submit" id="btn-crear-modelo">Crear Modelo</button>
                        <button id='btn-volver'>
                            <a href="/modelos">Volver</a>
                        </button>
                    </div>
                </form>
                {modeloAgregado &&
                    <p>{modeloAgregado}</p>
                }
            </section>
        </main>
    )
}

export default CrearModeloForm;