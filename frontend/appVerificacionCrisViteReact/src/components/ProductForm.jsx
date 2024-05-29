import { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

import UserIcon from './UserIcon.jsx';
import producto from '../assets/producto.jpg';

const ProductForm = () => {
  const [clientes, setClientes] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [requisitos, setRequisitos] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState('');
  const [selectedModelo, setSelectedModelo] = useState('');
  const [form, setForm] = useState({
    numeroCuadro: '',
    numeroInterruptor: '',
    numeroCliente: '',
  })
  const [imagenes, setImagenes] = useState([]);
  const [requisitosCumplidos, setRequisitosCumplidos] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Obtener el ID del usuario desde el token JWT
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUserId(decodedToken.id);
    }
  }, []);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const result = await axios.get('http://localhost:3001/clientes');
        setClientes(result.data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClientes();
  }, []);

  useEffect(() => {
    const fetchModelos = async () => {
      try {
        const result = await axios.get('http://localhost:3001/modelos');
        setModelos(result.data);
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };

    fetchModelos();
  }, []);

  const handleModeloChange = async (e) => {
    const modeloId = e.target.value;
    setSelectedModelo(modeloId);

    try {
      const result = await axios.get(`http://localhost:3001/requisitos/${modeloId}`);
      setRequisitos(result.data);
      const initialRequisitos = {};
      result.data.forEach(requisito => {
        initialRequisitos[requisito.id] = false;
      });
      setRequisitosCumplidos(initialRequisitos);
    } catch (error) {
      console.error('Error fetching requirements:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('requisito_')) {
      const requisitoId = name.split('_')[1];
      setRequisitosCumplidos(prevState => ({
        ...prevState,
        [requisitoId]: checked,
      }));
    } else {
      setForm((prevForm) => ({
        ...prevForm,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  useEffect(() => {
    const allChecked = Object.values(requisitosCumplidos).every(value => value);
    setIsButtonDisabled(!allChecked);
  }, [requisitosCumplidos]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImagenes((prevImages) => [...prevImages, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedCliente || !selectedModelo) {
        alert('Por favor, selecciona un cliente y un modelo.');
        return;
      }

      console.log('Datos enviados:', {
        ...form,
        id_usuario: userId, // Utilizar el ID del usuario logueado
        id_cliente: selectedCliente,
        id_modelo: selectedModelo,
        requisitos_cumplidos: requisitosCumplidos,
        imagenes: imagenes.map((img) => img.name),
      });

      // Crear PDF
      const doc = new jsPDF();
      doc.text('Verificación de Producto', 10, 10);
      doc.text(`N° Cuadro: ${form.numeroCuadro}`, 10, 20);
      doc.text(`Cliente: ${selectedCliente}`, 10, 30);
      doc.text(`Modelo: ${selectedModelo}`, 10, 40);
      doc.text(`N° Serie interruptor general: ${form.numeroInterruptor}`, 10, 50);
      doc.text(`N° Cliente: ${form.numeroCliente}`, 10, 60);
      doc.text(`Operario: ${userId}`, 10, 70); // Mostrar el número de operario
      requisitos.forEach((requisito, index) => {
        doc.text(`${requisito.nombre_requisito}: ${requisitosCumplidos[requisito.id] ? 'Sí' : 'No'}`, 10, 80 + (index * 10));
      });
      doc.save('verificacion_producto.pdf');

      // Leer el archivo Excel existente (si existe)
      const filePath = 'verificaciones.xlsx';
      let wb;
      try {
        const response = await axios.get('http://localhost:3001/excel', { responseType: 'arraybuffer' });
        const data = new Uint8Array(response.data);
        wb = XLSX.read(data, { type: 'array' });
      } catch (error) {
        wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([
          ['N° Cuadro', 'Cliente', 'Modelo', 'N° Serie interruptor general', 'N° Cliente', 'Operario', ...requisitos.map(r => r.nombre_requisito)]
        ]);
        XLSX.utils.book_append_sheet(wb, ws, 'Verificaciones');
      }

      // Añadir los nuevos datos al Excel
      const ws = wb.Sheets[wb.SheetNames[0]];
      const newData = [
        [form.numeroCuadro, selectedCliente, selectedModelo, form.numeroInterruptor, form.numeroCliente, userId, ...Object.values(requisitosCumplidos)]
      ];
      XLSX.utils.sheet_add_aoa(ws, newData, { origin: -1 });
      XLSX.writeFile(wb, filePath);

      // Guardar datos en la base de datos
      const response = await axios.post('http://localhost:3001/verificaciones', {
        ...form,
        id_usuario: userId, // Utilizar el ID del usuario logueado
        id_cliente: selectedCliente,
        id_modelo: selectedModelo,
        requisitos_cumplidos: requisitosCumplidos,
        imagenes: imagenes.map((img) => img.name),
      });

      if (response.status === 200) {
        alert('Verificación guardada con éxito');
      }
    } catch (error) {
      console.error('Error al guardar la verificación:', error);
      alert('Error al guardar la verificación');
    }
  };

  return (
    <main>
      <header>
        <h1>VERIFICACIÓN DE PRODUCTO</h1>
        <img src="src/assets/logo-istel.png" alt="logo Istel" />
      </header>
      <section className="formulario">
        <div className="first-section">
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="numCuadro">N° Cuadro:</label>
              <input type="text" name="numeroCuadro" size={45} value={form.numeroCuadro} onChange={handleInputChange} />
            </div>
            <div>
              <label htmlFor="cliente">Cliente:</label>
              <select name="clientes" value={selectedCliente} onChange={(e) => setSelectedCliente(e.target.value)}>
                <option value="seleccionarCliente">Selecciona un cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre_cliente}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="modelo">Modelo:</label>
              <select name="modelos" value={selectedModelo} onChange={handleModeloChange}>
                <option value="">Selecciona un modelo</option>
                {modelos.map((modelo) => (
                  <option key={modelo.id} value={modelo.id}>
                    {modelo.nombre_modelo}
                  </option>
                ))}
              </select>
            </div>
            <div className="operario-foto-producto">
              <div className="operario">
                <span>Operario</span>
                <div className="icono-operario">
                  <UserIcon />
                  <div className="num-operario">
                    <span>
                    {clientes.map(cliente => (
                      <span key={cliente.id}>{cliente.id}</span>
                    ))}
                    </span>
                  </div>
                </div>
              </div>
              <div className="foto-producto">
                <img src={producto} alt="producto" />
              </div>
            </div>
            <div className="campos-clientes">
              <div className="numSerieIntGeneral">
                <label>N° Serie interruptor general:</label>
                <input type="text" name="numeroInterruptor" value={form.numeroInterruptor} onChange={handleInputChange} />
              </div>
              <div className="numSerie-clientes">
              {clientes.map(cliente => (
                <div key={cliente.id} className="numSerie-cliente-adicional">
                  <label htmlFor={`numSerie-cliente${cliente.id}`}>Nº Cliente {cliente.id}</label>
                  <input type="text" name="numSerieClientes" size={15} id="inputs-clientes" />
                </div>
              ))}
              </div>
            </div>
            <div>
              <label>N° Cliente:</label>
              <input type="text" name="numeroCliente" value={form.numeroCliente} onChange={handleInputChange} />
            </div>
            <div>
              <label>Operario:</label>
              <input type="text" name="operario" value={userId} readOnly />
            </div>
            <div>
              <label>Requisitos:</label>
              {requisitos.map((requisito) => (
                <div key={requisito.id}>
                  <label>{requisito.nombre_requisito}</label>
                  <input type="checkbox" name={`requisito_${requisito.id}`} onChange={handleInputChange} />
                </div>
              ))}
            </div>
            <div>
              <label>Imágenes:</label>
              <input type="file" multiple onChange={handleImageUpload} />
              <div>
                {imagenes.map((img, index) => (
                  <img key={index} src={URL.createObjectURL(img)} alt={`Imagen ${index + 1}`} width="100" />
                ))}
              </div>
            </div>
            <button type="submit" disabled={isButtonDisabled}>Generar PDF y Añadir a Excel</button>
          </form>
        </div>
      </section>
    </main>    
  );
};

export default ProductForm;
