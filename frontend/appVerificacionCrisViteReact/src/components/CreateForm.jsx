import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const CreateForm = () => {
  const { tableName } = useParams();
  const [formData, setFormData] = useState({});
  const [columns, setColumns] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchColumns();
    if (tableName === 'modelos' || tableName === 'verificaciones') {
      fetchClientes();
    }
    if (tableName === 'verificaciones' || tableName === 'requisitos') {
      fetchModelos();
      fetchUsuarios();
    }
  }, [tableName]);

  const fetchColumns = async () => {
    try {
      const result = await axios.get(`http://localhost:3001/columns/${tableName}`);
      setColumns(result.data);
      const initialFormData = result.data.reduce((acc, column) => {
        acc[column] = '';
        return acc;
      }, {});
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error fetching columns:', error);
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

  const fetchUsuarios = async () => {
    try {
      const result = await axios.get('http://localhost:3001/usuarios');
      setUsuarios(result.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    navigate(`/admin/${tableName}`);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);  // Registro de depuración
    try {
        const url = tableName === 'verificaciones' 
            ? 'http://localhost:3001/admin/verificaciones' 
            : `http://localhost:3001/${tableName}`;
        await axios.post(url, formData);
        navigate(`/admin/${tableName}`);
    } catch (error) {
        console.error('Error creating record:', error);
    }
};

  return (
    <main className="create-main">
      <h1>Crear {tableName}</h1>
      <form className="form-crear" onSubmit={handleSubmit}>
        {columns.map((column) =>
          column !== "id_cliente" &&
          column !== "id_modelo" &&
          column !== "id_usuario" &&
          column !== "requisitos_cumplidos" ? (
            <div key={column}>
              <label>{column}:</label>
              <input
                type="text"
                name={column}
                value={formData[column]}
                onChange={handleChange}
              />
            </div>
          ) : column === "id_cliente" ? (
            <div key={column}>
              <label>{column}:</label>
              <select
                name={column}
                value={formData[column]}
                onChange={handleChange}
              >
                <option value="">Seleccione un cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre_cliente}
                  </option>
                ))}
              </select>
            </div>
          ) : column === "id_modelo" ? (
            <div key={column}>
              <label>{column}:</label>
              <select
                name={column}
                value={formData[column]}
                onChange={handleChange}
              >
                <option value="">Seleccione un modelo</option>
                {modelos.map((modelo) => (
                  <option key={modelo.id} value={modelo.id}>
                    {modelo.nombre_modelo}
                  </option>
                ))}
              </select>
            </div>
          ) : column === "id_usuario" ? (
            <div key={column}>
              <label>{column}:</label>
              <select
                name={column}
                value={formData[column]}
                onChange={handleChange}
              >
                <option value="">Seleccione un usuario</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre_usuario}
                  </option>
                ))}
              </select>
            </div>
          ) : (

            // TODO: Hacer que clave secreta salga como tipo contraseña, no tipo número
            <div key={column}>
              <label>{column}:</label>
              <input
                type="number"
                name={column}
                value={formData[column]}
                onChange={handleChange}
              />
            </div>
          )
        )}
        <br />
        <button className="btn-crear-editar" type="submit">Crear</button>
      </form>
      <button className="btn btn-eliminar" onClick={handleCancel}>Cancelar</button>
    </main>
  );
};

export default CreateForm;