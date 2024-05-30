import '../App.css'

const AdminForm = () => {
    return (
        <main className='admin-main'>
            <section>
                <h1>Panel Admin</h1>
                <ul>
                    <a href="/clientes">Clientes</a>
                    <a href="/modelos">Modelos</a>
                    <a href="/requisitos">Requisitos</a>
                    <a href="/usuarios">Usuarios</a>
                    <a href="/verificaciones">Verificaciones</a>
                </ul>
            </section>
        </main>
    )
}

export default AdminForm;