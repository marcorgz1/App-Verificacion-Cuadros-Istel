import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

const AdminTable = () => {
  const { tableName } = useParams();
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios.get(`http://localhost:3001/${tableName}`);
      setData(result.data);
    };
    fetchData();
  }, [tableName]);
  
  const handleCreate = () => {
    navigate(`/admin/${tableName}/create`);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:3001/${tableName}/${id}`);
    // Fetch the updated data after deletion
    // fetchData();
  };


  return (
    <div>
      <h1>Datos de {tableName}</h1>
      <table>
        <thead>
          <tr>
            {data.length > 0 && Object.keys(data[0]).map((key) => <th key={key}>{key}</th>)}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {Object.values(row).map((value, index) => <td key={index}>{value}</td>)}
              <td>
                <button onClick={() => navigate(`/admin/${tableName}/edit/${row.id}`)}>Editar</button>
                <button onClick={() => handleDelete(row.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleCreate}>Crear nuevo</button>
      <Link to="/admin-home">Volver al menú de administrador</Link>
    </div>
  );
};

export default AdminTable;
