import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import CreateForm from './CreateForm';

const AdminTable = () => {
    const { tableName } = useParams();
    const [data, setData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [tableName]);

    const fetchData = async () => {
        try {
            const endpoint = tableName === 'modelos' ? `http://localhost:3001/admin/${tableName}` : `http://localhost:3001/${tableName}`;
            const result = await axios.get(endpoint);

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

                const updatedData = result.data.map(item => {
                    const { nombre_usuario, nombre_cliente, nombre_modelo, ...filteredItem } = item;
                    return {
                        ...filteredItem,
                        id_usuario: usuarioMap[item.id_usuario] || item.nombre_usuario,
                        id_cliente: clienteMap[item.id_cliente] || item.nombre_cliente,
                        id_modelo: modeloMap[item.id_modelo] || item.nombre_modelo
                    };
                });

                setData(updatedData);
            } else {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
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

    const handleGeneratePDF = (row) => {
        const doc = new jsPDF();

        // Cargar imagen desde el archivo
        const logoUrl = "/src/assets/logo-istel.png";
        const logoImage = new Image();
        logoImage.src = logoUrl;

        // Configurar estilos
        const titleFontSize = 24;
        const textFontSize = 12;
        const margin = 20;
        const marginTop = 20;
        const lineSpacing = 10;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const logoWidth = 50;
        const logoHeight = 40;

        // Añadir logo
        doc.addImage(logoImage, "PNG", (pageWidth - logoWidth) / 2, marginTop, logoWidth, logoHeight);

        // Título
        doc.setFont("helvetica", "bold");
        doc.setFontSize(titleFontSize);
        doc.setTextColor(40, 40, 40);
        doc.text("Verificación de Producto", pageWidth / 2, marginTop + logoHeight + 20, { align: "center" });

        // Información general y requisitos cumplidos en tabla
        doc.setFont("helvetica", "normal");
        doc.setFontSize(textFontSize);
        doc.setTextColor(60, 60, 60);
        let currentY = marginTop + logoHeight + 40;

        const tableData = [
            ["N° Cuadro", row.numero_cuadro || ""],
            ["Cliente", row.id_cliente || ""],
            ["Modelo", row.id_modelo || ""],
            ["N° Serie interruptor general", row.numero_interruptor || ""],
            ["Operario", row.id_usuario || ""],
            ["Requisitos cumplidos", row.requisitos_cumplidos || ""],
            ["N° Cliente 1", row.numero_cliente || ""],
            ["N° Cliente 2", row.numero_cliente2 || ""],
            ["N° Cliente 3", row.numero_cliente3 || ""]
        ];

        const remainingTableData = [
            ["N° Cliente 4", row.numero_cliente4 || ""],
            ["N° Cliente 5", row.numero_cliente5 || ""]
        ];

        const addTableToDoc = (doc, startX, startY, tableData, textFontSize, cellPadding, margin) => {
            const cellWidth = (pageWidth - 2 * margin) / 2;

            tableData.forEach((row, rowIndex) => {
                const rowY = startY + rowIndex * (textFontSize + 2 * cellPadding);
                row.forEach((cell, colIndex) => {
                    const cellX = startX + colIndex * cellWidth;
                    doc.rect(cellX, rowY, cellWidth, textFontSize + 2 * cellPadding);
                    doc.text((cell || "").toString(), cellX + cellPadding, rowY + textFontSize + cellPadding / 2);
                });
            });

            return startY + tableData.length * (textFontSize + 2 * cellPadding);
        };

        const cellPadding = 5;
        currentY = addTableToDoc(doc, margin, currentY, tableData, textFontSize, cellPadding, margin);

        // Verificar si se necesita una segunda página para la tabla restante
        if (currentY + lineSpacing + remainingTableData.length * (textFontSize + 2 * cellPadding) > pageHeight) {
            doc.addPage();
            currentY = margin;
        } else {
            currentY += lineSpacing + 10;
        }

        currentY = addTableToDoc(doc, margin, currentY, remainingTableData, textFontSize, cellPadding, margin);

        // Verificar si se necesita una nueva página para las fotos
        if (currentY + lineSpacing + 30 > pageHeight) {
            doc.addPage();
            currentY = margin;
        } else {
            currentY += lineSpacing + 10;
        }

        // Añadir fotos al PDF
        const fotoWidth = 20;
        const fotoHeight = 20;
        let x = margin;
        let y = currentY;
        const fotos = JSON.parse(row.imagenes || "[]"); // Assuming images are stored as a JSON array of URLs
        fotos.forEach((foto, index) => {
            if (index % 3 === 0 && index !== 0) {
                y += fotoHeight + 10;
                x = margin;
                if (y + fotoHeight > pageHeight) {
                    doc.addPage();
                    y = margin;
                }
            }
            doc.addImage(`http://localhost:3001/uploads/${foto}`, "JPEG", x, y, fotoWidth, fotoHeight);
            x += fotoWidth + 10;
        });

        doc.save("verificacion_producto.pdf");
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
                                                    ) : (tableName === 'verificaciones' && key === 'imagenes' && value) ? (
                                                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                                            {JSON.parse(value).map((img, imgIndex) => (
                                                                <div key={imgIndex} style={{ flex: '1 0 30%', margin: '5px', width: '200px' }}>
                                                                    <img src={`http://localhost:3001/uploads/${img}`} alt="Previsualización" style={{ width: '100%', height: 'auto' }} />
                                                                </div>
                                                            ))}
                                                        </div>
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
                                                {tableName === 'verificaciones' && (
                                                    <button
                                                        className="btn-pdf"
                                                        onClick={() => handleGeneratePDF(row)}
                                                    >
                                                        Generar PDF
                                                    </button>
                                                )}
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
