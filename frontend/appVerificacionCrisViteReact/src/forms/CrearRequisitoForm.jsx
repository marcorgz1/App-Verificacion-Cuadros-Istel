import { useState } from 'react'

const CrearRequisitoForm = () => {
    const [nombreRequisito, setnombreRequisito] = useState('')
    const [requisitoAgregado, setRequisitoAgregado] = useState('')

    const handleInputChange = (event) => {
        setnombreRequisito(event.target.value)
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        fetch('http://localhost:3001/requisitos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre_requisito: nombreRequisito })
        })
            .then(response => response.json())                    
            .then(data => {
                console.log('Requisito Creado: ', data)

                setnombreRequisito('')
                setRequisitoAgregado('El nuevo requisito se agregó correctamente')
            })
            .catch(error => {
                console.error('Error al crear el requisito introducido:', error)
            })
    }
    return (
        <main className="crear-requisito-main">
            <section className="crear-requisito">
                <h2>Crear Requisito</h2>
                <br />
                <form onSubmit={handleSubmit}>
                    <label htmlFor="nomRequisito">Nombre:</label>
                    <input type="text" value={nombreRequisito} size={35} onChange={handleInputChange} required />
                    <br />
                    <label htmlFor="modelo">Modelo:</label>
                    <select name="modelos" id='select-modelos'>
                        <option value="-">-</option>
                        <option value="-">-</option>
                        <option value="-">-</option>
                    </select>
                    <div className='buttons-wrapper'>
                        <button type="submit" id="btn-crear-requisito">Crear Requisito</button>
                        <button id='btn-volver'>
                            <a href="/requisitos">Volver</a>
                        </button>
                    </div>
                </form>
                {requisitoAgregado &&
                    <p>{requisitoAgregado}</p>
                }
            </section>
        </main>
    )
}

export default CrearRequisitoForm;