import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import { PlusIcon, PencilIcon } from '@heroicons/react/24/solid'


interface Expediente {
    id: number;
    codigo: string;
    descripcion: string;
    fecha_registro: string;
    tecnico_id: number;
    justificacion?: string | null;
    estado: 'pendiente' | 'aprobado' | 'rechazado';
    aprobador_id?: number | null;
    fecha_estado?: string | null;
    activo: boolean;
}

const RegistroExpediente = () => {
    const { token, id: tecnicoId } = useAuth();
    const navigate = useNavigate();
    const [ expedientes, setExpedientes ] = useState<Expediente[]>([]);
    const [ loading, setLoading ] = useState(true);
    const [ modalOpen, setModalOpen ] = useState(false);
    const [ editingExpediente, setEditingExpediente ] = useState<Expediente | null>(null);


    const fetchExpedientes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/expedientes', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setExpedientes(data);
        } catch (error) {
            console.error('Error al obtener expedientes:', error);
        } finally {
            setLoading(false);
        }
    }, [ token ]);

    const handleSave = async (expediente: Partial<Expediente>) => {
        try {
            const url = `http://localhost:3001/api/expedientes/${editingExpediente?.id}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    codigo: expediente.codigo || editingExpediente?.codigo,
                    descripcion: expediente.descripcion || editingExpediente?.descripcion,
                    estado: expediente.estado || editingExpediente?.estado,
                    justificacion: expediente.justificacion || editingExpediente?.justificacion || null,
                    tecnico_id: tecnicoId,
                    aprobador_id: editingExpediente?.aprobador_id || null,
                    fecha_estado: editingExpediente?.fecha_estado || null,
                    activo: expediente.activo !== undefined ? expediente.activo : editingExpediente?.activo,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al guardar expediente');
            }

            setModalOpen(false);
            setEditingExpediente(null);
            fetchExpedientes();
        } catch (error: unknown) {
            console.error('Error al guardar expediente:', error);
            if (error instanceof Error) {
                alert(error.message || 'Ocurrió un error al guardar el expediente.');
            } else {
                alert('Ocurrió un error al guardar el expediente.');
            }
        }
    };

    const handleToggleActivo = async (id: number) => {
        try {
            const response = await fetch(`http://localhost:3001/api/expedientes/activardesactivar/${id}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cambiar estado de expediente');
            }

            fetchExpedientes();
        } catch (error: unknown) {
            console.error('Error al cambiar estado de expediente:', error);
            if (error instanceof Error) {
                alert(error.message || 'Ocurrió un error al cambiar el estado del expediente.');
            } else {
                alert('Ocurrió un error al cambiar el estado del expediente.');
            }
        }
    };

    const openModal = (expediente: Expediente) => {
        setEditingExpediente({ ...expediente });
        setModalOpen(true);
    };

    const closeModal = () => {
        setEditingExpediente(null);
        setModalOpen(false);
    };

    useEffect(() => {
        fetchExpedientes();
    }, [ fetchExpedientes ]);

    if (loading) {
        return <div className="text-center mt-6">Cargando expedientes...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-6">Gestión de Expedientes</h2>
            <button
                onClick={() => navigate('/expediente-form')}
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 mb-4 flex items-center gap-2"
            >
                <PlusIcon className="h-5 w-5" />
                Agregar Expediente
            </button>
            {expedientes.length === 0 ? (
                <div className="text-center text-gray-600 mt-4">No existen registros de expedientes.</div>
            ) : (
                <table className="w-full border-collapse border border-gray-300 text-sm text-left">
                    <thead>
                        <tr className="bg-gray-200 text-gray-700">
                            <th className="border border-gray-300 px-4 py-2">Código</th>
                            <th className="border border-gray-300 px-4 py-2">Descripción</th>
                            <th className="border border-gray-300 px-4 py-2">Estado</th>
                            <th className="border border-gray-300 px-4 py-2">Activo</th>
                            <th className="border border-gray-300 px-4 py-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expedientes.map((expediente, index) => (
                            <tr
                                key={expediente.id}
                                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                    } hover:bg-gray-100`}
                            >
                                <td className="border border-gray-300 px-4 py-2">{expediente.codigo}</td>
                                <td className="border border-gray-300 px-4 py-2">{expediente.descripcion}</td>
                                <td className="border border-gray-300 px-4 py-2">{expediente.estado}</td>
                                <td className="border border-gray-300 px-4 py-2 text-center">
                                    <input
                                        type="checkbox"
                                        checked={expediente.activo}
                                        onChange={() => handleToggleActivo(expediente.id)}
                                        className="cursor-pointer"
                                    />
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-center">
                                    <button
                                        onClick={() => expediente.activo && openModal(expediente)}
                                        className={`bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2 flex items-center gap-2 ${!expediente.activo ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                        disabled={!expediente.activo}
                                        title={expediente.activo ? '' : 'Para editar, el registro debe estar activo'}
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {modalOpen && (
                <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-md w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Editar Expediente</h3>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSave({
                                    codigo: editingExpediente?.codigo || '',
                                    descripcion: editingExpediente?.descripcion || '',
                                });
                            }}
                        >
                            <div className="mb-4">
                                <label className="block font-medium text-gray-700">Código</label>
                                <input
                                    type="text"
                                    value={editingExpediente?.codigo || ''}
                                    onChange={(e) =>
                                        setEditingExpediente((prev) =>
                                            prev ? { ...prev, codigo: e.target.value } : null
                                        )
                                    }
                                    className="w-full border border-gray-300 px-3 py-2 rounded-md"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block font-medium text-gray-700">Descripción</label>
                                <textarea
                                    value={editingExpediente?.descripcion || ''}
                                    onChange={(e) =>
                                        setEditingExpediente((prev) =>
                                            prev ? { ...prev, descripcion: e.target.value } : null
                                        )
                                    }
                                    className="w-full border border-gray-300 px-3 py-2 rounded-md"
                                    rows={3}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="text-gray-600 hover:underline"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegistroExpediente;
