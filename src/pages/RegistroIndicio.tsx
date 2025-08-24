import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import { PlusIcon, PencilIcon } from '@heroicons/react/24/solid';

interface Indicio {
    id: number;
    expediente_id: number;
    expediente_codigo: string;
    descripcion: string;
    color?: string;
    tamano?: string;
    peso?: number;
    ubicacion?: string;
    tecnico_id: number;
    fecha_registro: string;
    activo: boolean;
    estado: 'pendiente' | 'aprobado' | 'rechazado';
}

interface Expediente {
    id: number;
    codigo: string;
}

const RegistroIndicio = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [ indicios, setIndicios ] = useState<Indicio[]>([]);
    const [ loading, setLoading ] = useState(true);
    const [ modalOpen, setModalOpen ] = useState(false);
    const [ editingIndicio, setEditingIndicio ] = useState<Indicio | null>(null);
    const [ expedientesDisponibles, setExpedientesDisponibles ] = useState<Expediente[]>([]);

    const fetchIndicios = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/indicios', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setIndicios(data);
        } catch (error) {
            console.error('Error al obtener indicios:', error);
        } finally {
            setLoading(false);
        }
    }, [ token ]);

    const fetchExpedientes = useCallback(async () => {
        try {
            const res = await fetch('http://localhost:3001/api/expedientes', {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            setExpedientesDisponibles(data);
        } catch (error) {
            console.error('Error al cargar expedientes:', error);
        }
    }, [ token ]);

    const handleSave = async (indicio: Partial<Indicio>) => {
        try {
            const url = `http://localhost:3001/api/indicios/${editingIndicio?.id}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    descripcion: indicio.descripcion || editingIndicio?.descripcion,
                    color: indicio.color || editingIndicio?.color,
                    tamano: indicio.tamano || editingIndicio?.tamano,
                    peso: indicio.peso !== undefined ? indicio.peso : editingIndicio?.peso,
                    ubicacion: indicio.ubicacion || editingIndicio?.ubicacion,
                    estado: indicio.estado || editingIndicio?.estado,
                    expediente_id: editingIndicio?.expediente_id,
                    activo: indicio.activo !== undefined ? indicio.activo : editingIndicio?.activo,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al guardar indicio');
            }

            setModalOpen(false);
            setEditingIndicio(null);
            fetchIndicios();
        } catch (error: unknown) {
            console.error('Error al guardar indicio:', error);
            if (error instanceof Error) {
                alert(error.message || 'Ocurrió un error al guardar el indicio.');
            } else {
                alert('Ocurrió un error al guardar el indicio.');
            }
        }
    };

    const handleToggleActivo = async (id: number) => {
        try {
            const response = await fetch(`http://localhost:3001/api/indicios/activardesactivar/${id}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cambiar estado de indicio');
            }

            fetchIndicios();
        } catch (error: unknown) {
            console.error('Error al cambiar estado de indicio:', error);
            if (error instanceof Error) {
                alert(error.message || 'Ocurrió un error al cambiar el estado del indicio.');
            } else {
                alert('Ocurrió un error al cambiar el estado del indicio.');
            }
        }
    };

    const openModal = (indicio: Indicio) => {
        setEditingIndicio({ ...indicio });
        setModalOpen(true);
    };

    const closeModal = () => {
        setEditingIndicio(null);
        setModalOpen(false);
    };

    useEffect(() => {
        fetchIndicios();
    }, [ fetchIndicios ]);

    useEffect(() => {
        fetchExpedientes();
    }, [ fetchExpedientes ]);

    if (loading) {
        return <div className="text-center mt-6">Cargando indicios...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-6">Gestión de Indicios</h2>
            <button
                onClick={() => navigate('/indicio-form')}
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 mb-4 flex items-center gap-2"
            >
                <PlusIcon className="h-5 w-5" />
                Agregar Indicio
            </button>
            {indicios.length === 0 ? (
                <div className="text-center text-gray-600 mt-4">No existen registros de indicios.</div>
            ) : (
                <table className="w-full border-collapse border border-gray-300 text-sm text-left">
                    <thead>
                        <tr className="bg-gray-200 text-gray-700">
                            <th className="border border-gray-300 px-4 py-2">Código Expediente</th>
                            <th className="border border-gray-300 px-4 py-2">Descripción</th>
                            <th className="border border-gray-300 px-4 py-2">Color</th>
                            <th className="border border-gray-300 px-4 py-2">Tamaño</th>
                            <th className="border border-gray-300 px-4 py-2">Peso</th>
                            <th className="border border-gray-300 px-4 py-2">Ubicación</th>
                            <th className="border border-gray-300 px-4 py-2">Activo</th>
                            <th className="border border-gray-300 px-4 py-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {indicios.map((indicio, index) => (
                            <tr
                                key={indicio.id}
                                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                            >
                                <td className="border border-gray-300 px-4 py-2">{indicio.expediente_codigo}</td>
                                <td className="border border-gray-300 px-4 py-2">{indicio.descripcion}</td>
                                <td className="border border-gray-300 px-4 py-2">{indicio.color}</td>
                                <td className="border border-gray-300 px-4 py-2">{indicio.tamano}</td>
                                <td className="border border-gray-300 px-4 py-2">{indicio.peso}</td>
                                <td className="border border-gray-300 px-4 py-2">{indicio.ubicacion}</td>
                                <td className="border border-gray-300 px-4 py-2 text-center">
                                    <input
                                        type="checkbox"
                                        checked={indicio.activo}
                                        onChange={() => handleToggleActivo(indicio.id)}
                                        className="cursor-pointer"
                                    />
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-center">
                                    <button
                                        onClick={() => indicio.activo && openModal(indicio)}
                                        className={`bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2 flex items-center gap-2 ${!indicio.activo ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={!indicio.activo}
                                        title={indicio.activo ? '' : 'Para editar, el registro debe estar activo'}
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
                        <h3 className="text-lg font-bold mb-4">Editar Indicio</h3>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSave({
                                    expediente_id: Number(editingIndicio?.expediente_id),
                                    descripcion: editingIndicio?.descripcion || '',
                                    color: editingIndicio?.color || '',
                                    tamano: editingIndicio?.tamano || '',
                                    peso: editingIndicio?.peso || 0,
                                    ubicacion: editingIndicio?.ubicacion || '',
                                });
                            }}
                        >
                            <div className="mb-4">
                                <label className="block font-medium text-gray-700">Expediente</label>
                                <select
                                    value={editingIndicio?.expediente_id || ''}
                                    onChange={(e) =>
                                        setEditingIndicio((prev) =>
                                            prev ? { ...prev, expediente_id: Number(e.target.value) } : null
                                        )
                                    }
                                    className="w-full border border-gray-300 px-3 py-2 rounded-md"
                                    required
                                >
                                    <option value="">Seleccione un expediente</option>
                                    {expedientesDisponibles.map((exp) => (
                                        <option key={exp.id} value={exp.id}>
                                            {exp.codigo}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block font-medium text-gray-700">Descripción</label>
                                <textarea
                                    value={editingIndicio?.descripcion || ''}
                                    onChange={(e) =>
                                        setEditingIndicio((prev) =>
                                            prev ? { ...prev, descripcion: e.target.value } : null
                                        )
                                    }
                                    className="w-full border border-gray-300 px-3 py-2 rounded-md"
                                    rows={3}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block font-medium text-gray-700">Color</label>
                                <input
                                    type="text"
                                    value={editingIndicio?.color || ''}
                                    onChange={(e) =>
                                        setEditingIndicio((prev) =>
                                            prev ? { ...prev, color: e.target.value } : null
                                        )
                                    }
                                    className="w-full border border-gray-300 px-3 py-2 rounded-md"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block font-medium text-gray-700">Tamaño</label>
                                <input
                                    type="text"
                                    value={editingIndicio?.tamano || ''}
                                    onChange={(e) =>
                                        setEditingIndicio((prev) =>
                                            prev ? { ...prev, tamano: e.target.value } : null
                                        )
                                    }
                                    className="w-full border border-gray-300 px-3 py-2 rounded-md"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block font-medium text-gray-700">Peso</label>
                                <input
                                    type="number"
                                    value={editingIndicio?.peso || ''}
                                    onChange={(e) =>
                                        setEditingIndicio((prev) =>
                                            prev ? { ...prev, peso: parseFloat(e.target.value) } : null
                                        )
                                    }
                                    className="w-full border border-gray-300 px-3 py-2 rounded-md"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block font-medium text-gray-700">Ubicación</label>
                                <input
                                    type="text"
                                    value={editingIndicio?.ubicacion || ''}
                                    onChange={(e) =>
                                        setEditingIndicio((prev) =>
                                            prev ? { ...prev, ubicacion: e.target.value } : null
                                        )
                                    }
                                    className="w-full border border-gray-300 px-3 py-2 rounded-md"
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

export default RegistroIndicio;
