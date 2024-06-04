import { useState } from 'react'

const CrearUsuarioForm = () => {
    const [nombreUsuario, setnombreUsuario] = useState('')

    const handleInputChange = (event) => {
        setnombreUsuario(event.target.value)
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        fetch('http://localhost:3001/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre_usuario: nombreUsuario })
        })
            .then(response => response.json())                    
            .then(data => {
                console.log('Usuario Creado: ', data)

                setnombreUsuario('')
            })
            .catch(error => {
                console.error('Error al crear el usuario introducido:', error)
            })
    }
    return (
        <main className="crear-usuario-main">
            <section className="crear-usuario">
                <h2>Crear Usuario</h2>
                <br />
                <form onSubmit={handleSubmit}>
                    <label htmlFor="nomusuario">Nombre:</label>
                    <input type="text" value={nombreUsuario} size={35} onChange={handleInputChange} required />
                    <br />
                    <br />
                    <label htmlFor="modelo">Clave Secreta:</label>
                    <input type="password" name="claveSecreta" />
                </form>
                <div className='buttons-wrapper'>
                    <button type="submit" id="btn-crear-usuario">Crear Usuario</button>
                    <button id='btn-volver'>
                        <a href="/usuarios">Volver</a>
                    </button>
                </div>
            </section>
        </main>
    )
}

export default CrearUsuarioForm;