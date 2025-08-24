import { useEffect, useState } from 'react';
import useAuth from '../auth/useAuth';

interface Indicio {
    id: number;
    descripcion: string | null;
    color: string | null;
    tamano: string | null;
    peso: number | null;
    ubicacion: string | null;
    tecnico_id?: number;
}

interface Expediente {
    id: number;
    codigo: string;
    fecha_registro: string;
    tecnico_username: string;
    tecnico_id: number;
    estado: 'pendiente' | 'aprobado' | 'rechazado';
    descripcion?: string | null;
    justificacion?: string;
    aprobador_id?: number | null;
    aprobador_username?: string | null;
    fecha_estado?: string | null;
    indicios: Indicio[];
}

const RevisarExpedientes = () => {
    // Usar el contexto de autenticación
    const { token } = useAuth();

    const [ expedientes, setExpedientes ] = useState<Expediente[]>([]);
    const [ loading, setLoading ] = useState(true);
    const [ rechazoJustificacion, setRechazoJustificacion ] = useState('');
    const [ expedienteRechazando, setExpedienteRechazando ] = useState<number | null>(null);

    useEffect(() => {
        const fetchExpedientes = async () => {
            try {
                const expRes = await fetch('http://localhost:3001/api/expedientes', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (!expRes.ok) throw new Error('No se pudo obtener expedientes');
                const expData = await expRes.json();

                // Obtener indicios para cada expediente
                const expedientesWithIndicios = await Promise.all(
                    expData.map(async (exp: Expediente) => {
                        const indRes = await fetch(
                            `http://localhost:3001/api/indicios/expediente/${exp.id}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }
                        );
                        const indicios = indRes.ok ? await indRes.json() : [];
                        return {
                            ...exp,
                            indicios
                        };
                    })
                );
                setExpedientes(expedientesWithIndicios);
            } catch {
                setExpedientes([]);
            } finally {
                setLoading(false);
            }
        };
        fetchExpedientes();
    }, [ token ]);

    // Obtener el usuario autenticado como aprobador
    const { id: userId, username: userUsername } = useAuth();

    const aprobarExpediente = async (idExp: number) => {
        const expediente = expedientes.find(e => e.id === idExp);
        if (!expediente || !userId) return;
        try {
            await fetch(`http://localhost:3001/api/expedientes/${idExp}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...expediente,
                    estado: 'aprobado',
                    justificacion: '',
                    aprobador_id: userId
                })
            });
            setExpedientes(prev =>
                prev.map(e =>
                    e.id === idExp
                        ? {
                            ...e,
                            estado: 'aprobado',
                            justificacion: '',
                            aprobador_id: Number(userId),
                            aprobador_username: userUsername,
                            fecha_estado: new Date().toISOString()
                        }
                        : e
                )
            );
        } catch (error) {
            console.error('Error al aprobar expediente:', error);
            alert('Ocurrió un error al aprobar el expediente. Intente nuevamente.');
        }
    };

    const prepararRechazo = (id: number) => {
        setExpedienteRechazando(id);
        setRechazoJustificacion('');
    };

    const confirmarRechazo = async () => {
        if (expedienteRechazando && rechazoJustificacion.trim() !== '' && userId) {
            const expediente = expedientes.find(e => e.id === expedienteRechazando);
            if (!expediente) return;
            try {
                await fetch(`http://localhost:3001/api/expedientes/${expedienteRechazando}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ...expediente,
                        estado: 'rechazado',
                        justificacion: rechazoJustificacion,
                        aprobador_id: userId
                    })
                });
                setExpedientes(prev =>
                    prev.map(e =>
                        e.id === expedienteRechazando
                            ? {
                                ...e,
                                estado: 'rechazado',
                                justificacion: rechazoJustificacion,
                                aprobador_id: Number(userId),
                                aprobador_username: userUsername,
                                fecha_estado: new Date().toISOString()
                            }
                            : e
                    )
                );
            } catch (error) {
                console.error('Error al rechazar expediente:', error);
                alert('Ocurrió un error al rechazar el expediente. Intente nuevamente.');
            }
            setExpedienteRechazando(null);
            setRechazoJustificacion('');
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    if (loading) {
        return <div className="text-center mt-6">Cargando expedientes...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-6">Revisión de Expedientes</h2>

            {expedientes.map(expediente => (
                <div key={expediente.id} className="relative mb-6 p-4 border border-gray-300 rounded-md shadow-sm bg-white">
                    <div className="absolute top-4 right-4 text-right max-w-md">
                        <span className={`font-bold text-sm ${expediente.estado === 'aprobado' ? 'text-green-700' : expediente.estado === 'rechazado' ? 'text-red-700' : 'text-yellow-700'}`}>
                            Estado: {expediente.estado.toUpperCase()}
                        </span>
                        {expediente.estado === 'rechazado' && (
                            <div
                                className="mt-1 text-xs text-red-700 italic max-w-md break-words overflow-y-auto text-justify"
                                style={{ maxHeight: '6em', paddingRight: '0.5em' }}
                                title={expediente.justificacion}
                            >
                                Justificación: {expediente.justificacion}
                            </div>
                        )}
                    </div>

                    <h3 className="text-xl font-semibold mb-2 text-gray-800">
                        Expediente: {expediente.codigo}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">Fecha de registro: {formatDate(expediente.fecha_registro)}</p>
                    <p className="text-sm text-gray-600 mb-1">Técnico: {expediente.tecnico_username}</p>
                    {expediente.descripcion && (
                        <p className="text-sm text-gray-600 mb-1">Descripción: {expediente.descripcion}</p>
                    )}
                    {expediente.aprobador_username && (
                        <p className="text-sm text-gray-600 mb-1">
                            Aprobador: {expediente.aprobador_username}
                        </p>
                    )}
                    {expediente.fecha_estado && (
                        <p className="text-sm text-gray-600 mb-1">
                            Fecha cambio estado: {formatDate(expediente.fecha_estado)}
                        </p>
                    )}

                    <h4 className="font-medium text-gray-700 mb-2">Indicios:</h4>
                    <ul className="pl-5 list-disc text-sm text-gray-700 mb-4">
                        {expediente.indicios.length > 0 ? (
                            expediente.indicios.map((indicio, index) => (
                                <li key={indicio.id ?? index}>
                                    <strong>{indicio.descripcion || 'Sin descripción'}</strong>
                                    {indicio.color && <> – Color: {indicio.color}</>}
                                    {indicio.tamano && <> | Tamaño: {indicio.tamano}</>}
                                    {indicio.peso !== null && <> | Peso: {indicio.peso}g</>}
                                    {indicio.ubicacion && <> | Ubicación: {indicio.ubicacion}</>}
                                </li>
                            ))
                        ) : (
                            <li className="text-gray-400">Sin indicios registrados.</li>
                        )}
                    </ul>

                    {/* Mostrar siempre los botones para cambiar estado */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => aprobarExpediente(expediente.id)}
                            className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ${expediente.estado === 'rechazado' || expediente.estado === 'pendiente' ? '' : 'opacity-50 cursor-not-allowed'}`}
                            disabled={expediente.estado === 'aprobado'}
                        >
                            Aprobar
                        </button>
                        <button
                            onClick={() => prepararRechazo(expediente.id)}
                            className={`bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 ${expediente.estado === 'aprobado' || expediente.estado === 'pendiente' ? '' : 'opacity-50 cursor-not-allowed'}`}
                            disabled={expediente.estado === 'rechazado'}
                        >
                            Rechazar
                        </button>
                    </div>
                </div>
            ))}

            {expedienteRechazando && (
                <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-md w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4 text-red-700">Justificación del Rechazo</h3>
                        <textarea
                            value={rechazoJustificacion}
                            onChange={e => setRechazoJustificacion(e.target.value)}
                            rows={4}
                            className="w-full border border-gray-300 rounded-md p-2 mb-4"
                            placeholder="Describa el motivo del rechazo..."
                        ></textarea>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setExpedienteRechazando(null)}
                                className="text-gray-600 hover:underline"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarRechazo}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                disabled={rechazoJustificacion.trim() === ''}
                            >
                                Confirmar Rechazo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RevisarExpedientes;
