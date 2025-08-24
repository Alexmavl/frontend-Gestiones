import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

interface Expediente {
    codigo: string;
    solicitante: string;
    fecha: string;
    estado: string;
}

const ReporteAprobacionesRechazos = () => {
    const [ fecha, setFecha ] = useState('');
    const [ estado, setEstado ] = useState('');
    const [ expedientes, setExpedientes ] = useState<Expediente[]>([]);

    const estados = [ 'Aprobado', 'Rechazado', 'Pendiente' ];

    useEffect(() => {
        const data: Expediente[] = [
            { codigo: 'EXP001', solicitante: 'Juan Pérez', fecha: '2025-08-01', estado: 'Aprobado' },
            { codigo: 'EXP002', solicitante: 'María López', fecha: '2025-08-02', estado: 'Rechazado' },
            { codigo: 'EXP003', solicitante: 'Carlos Ruiz', fecha: '2025-08-03', estado: 'Pendiente' },
        ];
        setExpedientes(data);
    }, []);

    const filteredExpedientes = expedientes.filter((exp) => {
        return (
            (!fecha || exp.fecha === fecha) &&
            (!estado || exp.estado === estado)
        );
    });

    const handleGenerateReport = () => {
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text('DICRI - Reporte de Aprobaciones y Rechazos', 105, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 10, 30);
        doc.text(`Filtros: Fecha = ${fecha || 'Todos'}, Estado = ${estado || 'Todos'}`, 10, 40);

        doc.text('Listado de Expedientes:', 10, 50);

        // Encabezados de la tabla
        let y = 60;
        const startX = 10;
        const colWidths = [ 10, 35, 50, 35, 35 ]; // Ajusta según el contenido
        const headers = [ '#', 'Código', 'Solicitante', 'Fecha', 'Estado' ];

        // Dibujar encabezados
        let x = startX;
        headers.forEach((header, i) => {
            doc.text(header, x + 2, y);
            x += colWidths[ i ];
        });

        // Línea debajo de encabezados
        doc.line(startX, y + 2, x, y + 2);

        // Filas de datos
        y += 8;
        filteredExpedientes.forEach((exp, index) => {
            x = startX;
            doc.text(String(index + 1), x + 2, y);
            x += colWidths[ 0 ];
            doc.text(exp.codigo, x + 2, y);
            x += colWidths[ 1 ];
            doc.text(exp.solicitante, x + 2, y);
            x += colWidths[ 2 ];
            doc.text(exp.fecha, x + 2, y);
            x += colWidths[ 3 ];
            doc.text(exp.estado, x + 2, y);
            y += 8;
        });

        if (filteredExpedientes.length === 0) {
            doc.text('No se encontraron resultados.', 10, y);
        }

        doc.save('reporte-aprobaciones-rechazos.pdf');
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Reporte de Aprobaciones y Rechazos</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium mb-2" htmlFor="fecha">Fecha</label>
                    <input
                        id="fecha"
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2" htmlFor="estado">Estado</label>
                    <select
                        id="estado"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value="">Todos</option>
                        {estados.map((estado) => (
                            <option key={estado} value={estado}>
                                {estado}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300 text-sm text-left">
                    <thead className="bg-gray-200 text-gray-700">
                        <tr>
                            <th className="border border-gray-300 px-4 py-2">#</th>
                            <th className="border border-gray-300 px-4 py-2">Código</th>
                            <th className="border border-gray-300 px-4 py-2">Solicitante</th>
                            <th className="border border-gray-300 px-4 py-2">Fecha</th>
                            <th className="border border-gray-300 px-4 py-2">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpedientes.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-4 text-gray-600">No se encontraron resultados</td>
                            </tr>
                        ) : (
                            filteredExpedientes.map((exp, index) => (
                                <tr
                                    key={exp.codigo}
                                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                                >
                                    <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                                    <td className="border border-gray-300 px-4 py-2">{exp.codigo}</td>
                                    <td className="border border-gray-300 px-4 py-2">{exp.solicitante}</td>
                                    <td className="border border-gray-300 px-4 py-2">{exp.fecha}</td>
                                    <td className="border border-gray-300 px-4 py-2">{exp.estado}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <button
                onClick={handleGenerateReport}
                className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 transition-all"
            >
                Generar Reporte PDF
            </button>
        </div>
    );
};

export default ReporteAprobacionesRechazos;
