import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditForm = () => {
    const { tableName, id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [columns, setColumns] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [modelos, setModelos] = useState([]);
    const [requisitos, setRequisitos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        console.log(`Fetching data for table: ${tableName}, id: ${id}`);
        fetchColumns();
        fetchData();
        if (tableName === 'modelos' || tableName === 'verificaciones') {
            fetchClientes();
        }
        if (tableName === 'verificaciones' || tableName === 'requisitos') {
            fetchModelos();
            fetchRequisitos()
            fetchUsuarios();
        }
    }, [tableName, id]);
    

    const fetchColumns = async () => {
        try {
            const result = await axios.get(`http://localhost:3001/columns/${tableName}`);
            setColumns(result.data);
        } catch (error) {
            console.error('Error fetching columns:', error);
        }
    };

    const fetchData = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/${tableName}/${id}`);
            console.log('Response data:', response.data); // Log de la respuesta
            if (response.data.length > 0) {
                const fetchedData = response.data[0];
                console.log('Fetched data:', fetchedData); // Log de los datos obtenidos
                const initialFormData = {};
                for (const key in fetchedData) {
                    initialFormData[key] = fetchedData[key] !== null && fetchedData[key] !== undefined ? fetchedData[key] : '';
                }
                setFormData(initialFormData);
            } else {
                console.error("No data found");
            }
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };    

    const fetchClientes = async () => {
        try {
            const result = await axios.get('http://localhost:3001/clientes');
            setClientes(result.data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const fetchModelos = async () => {
        try {
            const result = await axios.get('http://localhost:3001/admin/modelos');
            setModelos(result.data);
        } catch (error) {
            console.error('Error fetching models:', error);
        }
    };

    const fetchRequisitos = async () => {
        try {
            const result = await axios.get('http://localhost:3001/admin/modelos');
            setRequisitos(result.data);
        } catch (error) {
            console.error('Error fetching requirements:', error);
        }
    };

    const fetchUsuarios = async () => {
        try {
            const result = await axios.get('http://localhost:3001/usuarios');
            setUsuarios(result.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleCancel = () => {
        navigate(`/admin/${tableName}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Datos enviados:', formData);
        try {
            await axios.put(`http://localhost:3001/${tableName}/${id}`, formData);
            navigate(`/admin/${tableName}`);
        } catch (error) {
            console.error('Error updating record:', error);
        }
    };

    if (loading) {
        return <div>Cargando datos...</div>;
    }

    return (
        <main className='edit-main'>
            <h2>Editar {tableName}</h2>
            <form className='form-editar' onSubmit={handleSubmit}>
                {columns.map((column) => (
                    column !== 'id_cliente' && column !== 'id_modelo' && column !== 'id_usuario' && column !== 'requisitos_cumplidos' ? (
                        <div key={column}>
                            <label htmlFor={column} className='form-label'>{column}:</label>
                            <input
                                type="text"
                                id={column}
                                name={column}
                                value={formData[column] || ''}
                                onChange={handleChange}
                            />
                        </div>
                    ) : column === 'id_cliente' ? (
                        <div key={column}>
                            <label htmlFor={column} className='form-label'>{column}:</label>
                            <select name={column} value={formData[column] || ''} onChange={handleChange}>
                                <option value="">Seleccione un cliente</option>
                                {clientes.map(cliente => (
                                    <option key={cliente.id} value={cliente.id}>{cliente.nombre_cliente}</option>
                                ))}
                            </select>
                        </div>
                    ) : column === 'id_modelo' ? (
                        <div key={column}>
                            <label htmlFor={column} className='form-label'>{column}:</label>
                            <select name={column} value={formData[column] || ''} onChange={handleChange}>
                                <option value="">Seleccione un modelo</option>
                                {modelos.map(modelo => (
                                    <option key={modelo.id} value={modelo.id}>{modelo.nombre_modelo}</option>
                                ))}
                            </select>
                        </div>
                    ) : column === 'id_requisito' ? (
                        <div key={column}>
                            <label htmlFor={column} className='form-label'>{column}:</label>
                            <select name={column} value={formData[column] || ''} onChange={handleChange}>
                                <option value="">Seleccione un modelo</option>
                                {requisitos.map(requisito => (
                                    <option key={requisito.id} value={requisito.nombre_requisito}>{requisito.id_modelo}</option>
                                ))}
                            </select>
                        </div>
                    ) : column === 'id_usuario' ? (
                        <div key={column}>
                            <label htmlFor={column} className='form-label'>{column}:</label>
                            <select name={column} value={formData[column] || ''} onChange={handleChange}>
                                <option value="">Seleccione un usuario</option>
                                {usuarios.map(usuario => (
                                    <option key={usuario.id} value={usuario.id}>{usuario.nombre_usuario}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div key={column}>
                            <label htmlFor={column} className='form-label'>{column}:</label>
                            <input
                                type="number"
                                id={column}
                                name={column}
                                value={formData[column] || ''}
                                onChange={handleChange}
                            />
                        </div>
                    )
                ))}
                <br />
                <button className='btn-crear-editar' type="submit">Guardar</button>
            </form>
            <br />
            <button className='btn btn-eliminar' type="button" onClick={handleCancel}>Cancelar</button>
        </main>
    );
};

export default EditForm;
