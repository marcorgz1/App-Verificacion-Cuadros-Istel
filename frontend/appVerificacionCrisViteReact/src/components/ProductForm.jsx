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
  const [clientes, setClientes] = useState([{ id: 1 }]);
  const [modelos, setModelos] = useState([]);
  const [requisitos, setRequisitos] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState("");
  const [selectedModelo, setSelectedModelo] = useState("");
  const [form, setForm] = useState({
    numeroCuadro: "",
    numeroInterruptor: "",
    numeroCliente: "",
  });
  const [imagenes, setImagenes] = useState([]);
  const [requisitosCumplidos, setRequisitosCumplidos] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [userId, setUserId] = useState(null);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const [fotos, setFotos] = useState([]);
  const [contadorFotos, setContadorFotos] = useState(0);
  const maxFotos = 6;

  const añadirClientes = () => {
    if (clientes.length < 5) {
      setClientes((prevClientes) => [
        ...prevClientes,
        { id: prevClientes.length + 1 }
      ]);
    } else {
      alert("Error: No se pueden añadir más de 5 clientes");
    }
  };

  useEffect(() => {
    // Obtener el ID del usuario desde el token JWT
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setUserId(decodedToken.id);
    }
  }, []);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const result = await axios.get("http://localhost:3000/clientes");
        setClientes(result.data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    fetchClientes();
  }, []);

  useEffect(() => {
    const fetchModelos = async () => {
      try {
        const result = await axios.get("http://localhost:3000/modelos");
        setModelos(result.data);
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };

    fetchModelos();
  }, []);

  const handleModeloChange = async (e) => {
    const modeloId = e.target.value;
    setSelectedModelo(modeloId);

    try {
      const result = await axios.get(
        `http://localhost:3001/requisitos/${modeloId}`
      );
      setRequisitos(result.data);
      const initialRequisitos = {};
      result.data.forEach((requisito) => {
        initialRequisitos[requisito.id] = false;
      });
      setRequisitosCumplidos(initialRequisitos);
    } catch (error) {
      console.error("Error fetching requirements:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("requisito_")) {
      const requisitoId = name.split("_")[1];
      setRequisitosCumplidos((prevState) => ({
        ...prevState,
        [requisitoId]: checked,
      }));
    } else {
      setForm((prevForm) => ({
        ...prevForm,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  useEffect(() => {
    const allChecked = Object.values(requisitosCumplidos).every(
      (value) => value
    );
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
        alert("Por favor, selecciona un cliente y un modelo.");
        return;
      }

      console.log("Datos enviados:", {
        ...form,
        id_usuario: userId, // Utilizar el ID del usuario logueado
        id_cliente: selectedCliente,
        id_modelo: selectedModelo,
        requisitos_cumplidos: requisitosCumplidos,
        imagenes: imagenes.map((img) => img.name),
      });

      // Crear PDF
      const doc = new jsPDF();
      doc.text("Verificación de Producto", 10, 10);
      doc.text(`N° Cuadro: ${form.numeroCuadro}`, 10, 20);
      doc.text(`Cliente: ${selectedCliente}`, 10, 30);
      doc.text(`Modelo: ${selectedModelo}`, 10, 40);
      doc.text(
        `N° Serie interruptor general: ${form.numeroInterruptor}`,
        10,
        50
      );
      doc.text(`N° Cliente: ${form.numeroCliente}`, 10, 60);
      doc.text(`Operario: ${userId}`, 10, 70); // Mostrar el número de operario
      requisitos.forEach((requisito, index) => {
        doc.text(
          `${requisito.nombre_requisito}: ${
            requisitosCumplidos[requisito.id] ? "Sí" : "No"
          }`,
          10,
          80 + index * 10
        );
      });
      doc.save("verificacion_producto.pdf");

      // Leer el archivo Excel existente (si existe)
      const filePath = "verificaciones.xlsx";
      let wb;
      try {
        const response = await axios.get("http://localhost:3001/excel", {
          responseType: "arraybuffer",
        });
        const data = new Uint8Array(response.data);
        wb = XLSX.read(data, { type: "array" });
      } catch (error) {
        wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([
          [
            "N° Cuadro",
            "Cliente",
            "Modelo",
            "N° Serie interruptor general",
            "N° Cliente",
            "Operario",
            ...requisitos.map((r) => r.nombre_requisito),
          ],
        ]);
        XLSX.utils.book_append_sheet(wb, ws, "Verificaciones");
      }

      // Añadir los nuevos datos al Excel
      const ws = wb.Sheets[wb.SheetNames[0]];
      const newData = [
        [
          form.numeroCuadro,
          selectedCliente,
          selectedModelo,
          form.numeroInterruptor,
          form.numeroCliente,
          userId,
          ...Object.values(requisitosCumplidos),
        ],
      ];
      XLSX.utils.sheet_add_aoa(ws, newData, { origin: -1 });
      XLSX.writeFile(wb, filePath);

      // Guardar datos en la base de datos
      const response = await axios.post(
        "http://localhost:3000/verificaciones",
        {
          ...form,
          id_usuario: userId, // Utilizar el ID del usuario logueado
          id_cliente: selectedCliente,
          id_modelo: selectedModelo,
          requisitos_cumplidos: requisitosCumplidos,
          imagenes: imagenes.map((img) => img.name),
        }
      );

      if (response.status === 200) {
        alert("Verificación guardada con éxito");
      }
    } catch (error) {
      console.error("Error al guardar la verificación:", error);
      alert("Error al guardar la verificación");
    }
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
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
    setFotos((prevPhotos) => [...prevPhotos, newPhoto]);
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
                onChange={(e) => setSelectedCliente(e.target.value)}
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
                  name="numSerieIntGeneral"
                  size={15}
                  className="inputs-clientes"
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
          {[...Array(9)].map((_, i) => (
            <div className="revision" key={i}>
              <div className="numRevision">
                <span>{i + 1}</span>
              </div>
              <input type="text" placeholder="Nombre" size="60" />
              <label className="custom-checkbox">
                <input type="checkbox" name="checkRevision" />
                <span className="checkmark"></span>
              </label>
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
                    src={URL.createObjectURL(foto)}
                    alt={`Foto ${index + 1}`}
                    style={{
                      marginLeft: "15px",
                      width: "75px",
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
          <button type="submit" disabled={isButtonDisabled}>
            Generar PDF/Añadir a Excel
          </button>
        </footer>
      </main>
    </>
  );
};

export default ProductForm;
