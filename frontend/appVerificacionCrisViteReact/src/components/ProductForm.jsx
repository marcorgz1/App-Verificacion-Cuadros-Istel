import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import "../App.css";

import UserIcon from "../icons/UserIcon.jsx";
import PlusIcon from "../icons/PlusIcon.jsx";
import producto from "../assets/producto.jpg";
import { FaCamera } from "react-icons/fa";

const ProductForm = () => {
  const [clientes, setClientes] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [requisitos, setRequisitos] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState('');
  const [selectedClienteNombre, setSelectedClienteNombre] = useState('');
  const [selectedModelo, setSelectedModelo] = useState('');
  const [selectedModeloNombre, setSelectedModeloNombre] = useState('');
  const [form, setForm] = useState({
    numeroCuadro: '',
    numeroInterruptor: ''
  });
  const [requisitosCumplidos, setRequisitosCumplidos] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [userId, setUserId] = useState(null);

  const [fotos, setFotos] = useState([]);
  const [nombresFotos, setNombresFotos] = useState([]);
  const videoRef = useRef(null);
  const [contadorFotos, setContadorFotos] = useState(0);
  const maxFotos = 6;
  const [stream, setStream] = useState(null);

  const añadirClientes = () => {
    if (clientes.length < 3) {
      setClientes(prevClientes => [...prevClientes, { id: prevClientes.length + 1 }]);
    }
  };

  useEffect(() => {
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

  const fetchModelosCliente = async (clienteId) => {
    try {
      const result = await axios.get(`http://localhost:3001/modelos`, {
        params: {
          clienteId: clienteId
        }
      });
      setModelos(result.data);
    } catch (error) {
      console.error('Error fetching models for client:', error);
    }
  };

  useEffect(() => {
    if (selectedCliente) {
      fetchModelosCliente(selectedCliente);
    } else {
      setModelos([]);
    }
  }, [selectedCliente]);

  const fetchRequisitos = async (modeloId) => {
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

  const handleClienteChange = (e) => {
    const clienteId = e.target.value;
    const clienteNombre = e.target.options[e.target.selectedIndex].text;
    setSelectedCliente(clienteId);
    setSelectedClienteNombre(clienteNombre);
    setSelectedModelo('');
    setSelectedModeloNombre('');
  };

  const handleModeloChange = (e) => {
    const modeloId = e.target.value;
    const modeloNombre = e.target.options[e.target.selectedIndex].text;
    setSelectedModelo(modeloId);
    setSelectedModeloNombre(modeloNombre);
    fetchRequisitos(modeloId);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedCliente || !selectedModelo) {
        alert('Por favor, selecciona un cliente y un modelo.');
        return;
      }
  
      const data = {
        ...form,
        id_usuario: userId,
        id_cliente: selectedCliente,
        nombre_cliente: selectedClienteNombre,
        id_modelo: selectedModelo,
        nombre_modelo: selectedModeloNombre,
        requisitos_cumplidos: requisitos.filter(r => requisitosCumplidos[r.id]).map(r => r.nombre_requisito),
        nombre_fotos: nombresFotos
        };
        
      const excelData = {
        ...data,
        requisitos_cumplidos: data.requisitos_cumplidos.join(', '),
        nombre_fotos: data.nombre_fotos.join(', ')
      }
  
      console.log('Datos enviados:', data, excelData);
  
      const response = await axios.post('http://localhost:3001/verificaciones', data);
  
      if (response.status === 200) {
        alert('Verificación guardada con éxito');
  
        // Generar PDF
        const doc = new jsPDF();
        doc.text('Verificación de Producto', 10, 10);
        doc.text(`N° Cuadro: ${form.numeroCuadro}`, 10, 20);
        doc.text(`Cliente: ${selectedClienteNombre}`, 10, 30);
        doc.text(`Modelo: ${selectedModeloNombre}`, 10, 40);
        doc.text(`N° Serie interruptor general: ${form.numeroInterruptor}`, 10, 50);
        doc.text(`Operario: ${userId}`, 10, 60);
        doc.text(`Requisitos cumplidos: ${data.requisitos_cumplidos.join(', ')}`, 10, 70);
        
        // Añadir fotos al PDF
        const fotoWidth = 40;
        const fotoHeight = 40;
        let x = 10;
        let y = 80 + (requisitos.length * 10);
        fotos.forEach((foto, index) => {
          if (index % 3 === 0 && index !== 0) {
            y += fotoHeight + 10;
            x = 10;
          }
          doc.addImage(foto, 'JPEG', x, y, fotoWidth, fotoHeight);
          x += fotoWidth + 10;
        });
  
        doc.save('verificacion_producto.pdf');
  
        // Generar Excel
        const worksheet = XLSX.utils.json_to_sheet([excelData]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Verificaciones');
        XLSX.writeFile(workbook, 'verificacion_producto.xlsx');
      }
    } catch (error) {
      console.error('Error al guardar la verificación:', error);
      alert('Error al guardar la verificación');
    }
  };

  // const handleRequisitoChange = (id, checked) => {
  //   setRequisitos(prevRequisitos => 
  //     prevRequisitos.map(requisito =>
  //       requisito.id === id ? { ...requisito, cumplido: checked } : requisito
  //     )
  //   );
  // };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error al acceder a la camara:", error);
    }
  };

  const takePhoto = () => {
    if (contadorFotos >= maxFotos) {
      alert("No se pueden tomar más fotos");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const newPhoto = canvas.toDataURL("image/png");
    const photoName = `${contadorFotos + 1}.png`;
    setFotos((prevPhotos) => [...prevPhotos, newPhoto]);
    setNombresFotos((prevNames) => [...prevNames, photoName]);
    setContadorFotos(contadorFotos + 1);

    if (contadorFotos + 1 > maxFotos) {
      stopCamera();
      alert("No se pueden tomar más fotos");
    }
  };

  const handleCameraClick = () => {
    if (!stream) {
      openCamera();
    } else {
      takePhoto();
    }

    if (fotos.length < maxFotos) {
      if (fotos.length + 1 === maxFotos) {
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  return (
    <>
      <header>
        <h1>VERIFICACIÓN DE PRODUCTO</h1>
        <img src="src/assets/logo-istel.png" alt="logo Istel" />
      </header>
      <main>
        <section className="formulario">
          <div className="first-section">
            <form onSubmit={handleSubmit}>
              <label htmlFor="numCuadro">N° Cuadro:</label>
              <input
                type="text"
                name="numeroCuadro"
                size={45}
                value={form.numeroCuadro}
                onChange={handleInputChange}
              />
              <br />
              <label htmlFor="cliente">Cliente:</label>
              <select
                name="clientes"
                value={selectedCliente}
                onChange={handleClienteChange}
              >
                <option value="seleccionarCliente">
                  Selecciona un cliente
                </option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre_cliente}
                  </option>
                ))}
              </select>
              <br />
              <label htmlFor="modelo">Modelo:</label>
              <select
                name="modelos"
                value={selectedModelo}
                onChange={handleModeloChange}
              >
                <option value="">Selecciona un modelo</option>
                {modelos.map((modelo) => (
                  <option key={modelo.id} value={modelo.id}>
                    {modelo.nombre_modelo}
                  </option>
                ))}
              </select>
              <button type="submit" disabled={isButtonDisabled}>
                Generar PDF/Añadir Excel
              </button>
            </form>
            <div className="operario-foto-producto">
              <div className="operario">
                <span>Operario</span>
                <div className="icono-operario">
                  <UserIcon />
                  <div className="num-operario">
                    <span>1</span>
                  </div>
                </div>
              </div>
              <div className="foto-producto">
                <img src={producto} alt="producto" />
              </div>
            </div>
          </div>
          <div className="campos-clientes">
            <div className="numSeries-clientes">
              <div className="numSerieIntGeneral">
                <label htmlFor="numSerieIntGeneral">
                  Nº Serie Interruptor General
                </label>
                <input
                  type="text"
                  name="numeroInterruptor"
                  size={15}
                  className="inputs-clientes"
                  value={form.numeroInterruptor}
                  onChange={handleInputChange}
                />
              </div>
              <div className="numSerie-clientes">
                {clientes
                  .map(cliente => (
                    <div key={cliente.id} className="numSerie-cliente-adicional">
                      <label htmlFor={`numSerie-cliente${cliente.id}`}>Nº Cliente {cliente.id}</label>
                      <input
                        type="text"
                        name="numSerieClientes"
                        size={15}
                        id={`numSerie-cliente${cliente.id}`}
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className="cliente-adicional">
            <button onClick={añadirClientes}>
              <PlusIcon />
            </button>
            <span>Añadir cliente adicional</span>
          </div>
        </section>
        <section className="revisiones">
        {requisitos.map((requisito) => (
          <div key={requisito.id} className="checkbox-wrapper">
              <span className="number">{requisito.id}</span>
              <label className="name-input">{requisito.nombre_requisito}</label>
              <input
                  type="checkbox"
                  className="styled-checkbox"
                  id={`checkbox_${requisito.id}`}
                  name={`requisito_${requisito.id}`}
                  checked={requisitosCumplidos[requisito.id] || false}
                  onChange={(e) => handleInputChange(e)}
              />
              <label htmlFor={`checkbox_${requisito.id}`} className="checkbox-label"></label>
          </div>
        ))}
        </section>
        <footer>
          <div className="fotos">
            <div className="fotos-tomadas">
              {Array.isArray(fotos) &&
                fotos.map((foto, index) => (
                  <img
                    key={index}
                    src={foto}
                    alt={`Foto ${index + 1}`}
                    style={{
                      marginLeft: "15px",
                      width: "80px",
                      height: "75px",
                      objectFit: "cover",
                    }}
                  />
                ))}
            </div>
            <div className="camera-icon-wrapper">
              {fotos.length < maxFotos && (
                <div className="camera">
                  <video
                    ref={videoRef}
                    autoPlay
                    style={{
                      display:
                        videoRef.current && videoRef.current.srcObject
                          ? "block"
                          : "none",
                    }}
                  ></video>
                </div>
              )}
            </div>
            <FaCamera className="camera-icon" onClick={handleCameraClick} />
          </div>          
        </footer>
      </main>
    </>
  );
};

export default ProductForm;