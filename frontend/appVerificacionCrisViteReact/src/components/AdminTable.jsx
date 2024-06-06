import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import CreateForm from './CreateForm'; // Asegúrate de que la ruta sea correcta

const AdminTable = () => {
    const { tableName } = useParams();
    const [data, setData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [tableName]);

    const fetchData = async () => {
        const result = await axios.get(`http://localhost:3001/${tableName}`);
        setData(result.data);
    };

    const handleCreate = () => {
        navigate(`/admin/${tableName}/create`);
    };

    const handleDelete = async (id) => {
        await axios.delete(`http://localhost:3001/${tableName}/${id}`);
        fetchData();
    };

    return (
        <Routes>
            <Route path="create" element={<CreateForm />} />
            <Route
                path=""
                element={
                    <main>
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
                                            {Object.values(row).map((value, index) => (
                                                <td key={index}>{value}</td>
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
