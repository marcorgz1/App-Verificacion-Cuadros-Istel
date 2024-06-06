import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import CreateForm from './CreateForm';

const AdminTable = () => {
    const { tableName } = useParams();
    const [data, setData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [tableName]);

    const fetchData = async () => {
        const endpoint = tableName === 'modelos' ? `http://localhost:3001/admin/${tableName}` : `http://localhost:3001/${tableName}`;
        const result = await axios.get(endpoint);
        setData(result.data);
        if (tableName === 'verificaciones') {
            const usuarios = await axios.get('http://localhost:3001/usuarios');
            const clientes = await axios.get('http://localhost:3001/clientes');
            const modelos = await axios.get('http://localhost:3001/modelos');
            
            const usuarioMap = usuarios.data.reduce((map, user) => {
                map[user.id] = user.nombre_usuario;
                return map;
            }, {});
            
            const clienteMap = clientes.data.reduce((map, cliente) => {
                map[cliente.id] = cliente.nombre_cliente;
                return map;
            }, {});
    
            const modeloMap = modelos.data.reduce((map, modelo) => {
                map[modelo.id] = modelo.nombre_modelo;
                return map;
            }, {});
    
            const updatedData = result.data.map(item => ({
                ...item,
                id_usuario: usuarioMap[item.id_usuario] || item.id_usuario,
                id_cliente: clienteMap[item.id_cliente] || item.id_cliente,
                id_modelo: modeloMap[item.id_modelo] || item.id_modelo,
            }));
    
            setData(updatedData);
        } else {
            setData(result.data);
        }
    };

    const handleCreate = () => {
        navigate(`/admin/${tableName}/create`);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/${tableName}/${id}`);
            fetchData();
        } catch (error) {
            console.error('There was an error deleting the record:', error);
            alert(`Error al eliminar el registro: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <Routes>
            <Route path="create" element={<CreateForm />} />
            <Route
                path=""
                element={
                    <main className='listas-main'>
                        <h1>Datos de {tableName}</h1>
                        <section className="tabla-data">
                            <table>
                                <thead>
                                    <tr>
                                        {data.length > 0 &&
                                            Object.keys(data[0]).map((key) => (
                                                <th key={key}>{key}</th>
                                            ))}
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((row) => (
                                        <tr key={row.id}>
                                            {Object.entries(row).map(([key, value], index) => (
                                                <td key={index}>
                                                    {tableName === 'modelos' && key === 'imagen' && value ? (
                                                        <img src={`http://localhost:3001/uploads/${value}`} alt="Previsualización" style={{ width: '100px', height: '100px' }} />
                                                    ) : (
                                                        value
                                                    )}
                                                </td>
                                            ))}
                                            <td>
                                                <button
                                                    className="btn-crear-editar"
                                                    onClick={() =>
                                                        navigate(`/admin/${tableName}/edit/${row.id}`)
                                                    }
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    className="btn-eliminar"
                                                    onClick={() => handleDelete(row.id)}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <br />
                            <button className="btn-crear-editar" onClick={handleCreate}>
                                Crear nuevo
                            </button>
                            <br />
                            <Link to="/admin-home">Volver al menú de administrador</Link>
                        </section>
                    </main>
                }
            />
        </Routes>
    );
};

export default AdminTable;
