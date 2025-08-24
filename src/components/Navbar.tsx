import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';

interface Indicio {
    expedienteId: string;
    descripcion: string;
    color: string;
    tamaño: string;
    peso: string;
    ubicacion: string;
    tecnico: string;
}

interface Expediente {
    id: string;
    codigo: string;
}

const IndicioForm = () => {
    const { token, username, id: userId } = useAuth();
    const navigate = useNavigate();

    const [ indicio, setIndicio ] = useState<Indicio>({
        expedienteId: '',
        descripcion: '',
        color: '',
        tamaño: '',
        peso: '',
        ubicacion: '',
        tecnico: username ?? ''
    });

    const [ expedientesDisponibles, setExpedientesDisponibles ] = useState<Expediente[]>([]);
    const [ loading, setLoading ] = useState<boolean>(true);
    const [ feedback, setFeedback ] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        const fetchExpedientes = async () => {
            setLoading(true);
            try {
                const res = await fetch('http://localhost:3001/api/expedientes', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = await res.json();
                setExpedientesDisponibles(data);
            } catch {
                alert('Error al cargar los expedientes. Intente de nuevo más tarde.');
            } finally {
                setLoading(false);
            }
        };
        fetchExpedientes();
    }, [ token ]);

    useEffect(() => {
        setIndicio(prev => ({ ...prev, tecnico: username ?? '' }));
    }, [ username ]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setIndicio({ ...indicio, [ name ]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);

        // Validación de campos obligatorios
        if (!indicio.expedienteId || !indicio.descripcion) {
            setFeedback({ type: 'error', message: 'Todos los campos obligatorios deben estar completos.' });
            return;
        }

        // Validar que expedienteId sea un número
        const expedienteIdNum = Number(indicio.expedienteId);
        if (isNaN(expedienteIdNum)) {
            setFeedback({ type: 'error', message: 'El expediente seleccionado no es válido.' });
            return;
        }

        // Validar que userId esté presente y sea número
        if (!userId || isNaN(Number(userId))) {
            setFeedback({ type: 'error', message: 'No se pudo obtener el técnico actual.' });
            return;
        }

        // Convierte peso a número si es posible
        let pesoValue: number | null = null;
        if (indicio.peso.trim() !== '') {
            pesoValue = Number(indicio.peso);
            if (isNaN(pesoValue)) {
                setFeedback({ type: 'error', message: 'El peso debe ser un número válido.' });
                return;
            }
        }

        try {
            const payload = {
                expediente_id: expedienteIdNum,
                descripcion: indicio.descripcion,
                color: indicio.color,
                tamano: indicio.tamaño,
                peso: pesoValue,
                ubicacion: indicio.ubicacion,
                tecnico_id: Number(userId)
            };
            const response = await fetch('http://localhost:3001/api/indicios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al crear indicio');
            }

            alert('Indicio registrado correctamente.');
            navigate('/indicio'); // Navigate to /indicio

            setIndicio({
                expedienteId: '',
                descripcion: '',
                color: '',
                tamaño: '',
                peso: '',
                ubicacion: '',
                tecnico: username ?? ''
            });
        } catch (error: unknown) {
            console.error('Error al crear indicio:', error);
            if (error instanceof Error) {
                setFeedback({ type: 'error', message: error.message || 'Error desconocido' });
            } else {
                setFeedback({ type: 'error', message: 'Error desconocido' });
            }
        }
    };

    // Oculta el mensaje de feedback después de 5 segundos
    useEffect(() => {
        if (feedback) {
            const timer = setTimeout(() => setFeedback(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [ feedback ]);

    return (
        <div>
            <button
                onClick={() => navigate('/indicio')}
                className="bg-gray-200 text-blue-700 px-4 py-2 rounded hover:bg-gray-300 transition-all mb-4"
            >
                ← Volver a Indicios
            </button>
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-md mt-8">
                <h2 className="text-2xl font-semibold mb-4 text-blue-800">Registrar Indicio</h2>

                {feedback && (
                    <p className={`mb-4 ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {feedback.message}
                    </p>
                )}

                <div className="mb-4">
                    <label className="block font-medium text-gray-700">Expediente</label>
                    <select
                        name="expedienteId"
                        value={indicio.expedienteId}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 px-3 py-2 rounded-md"
                        disabled={loading}
                    >
                        <option value="">Seleccione un expediente</option>
                        {expedientesDisponibles.map(exp => (
                            <option key={exp.id} value={exp.id}>
                                {exp.codigo}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block font-medium text-gray-700">Descripción</label>
                    <input
                        type="text"
                        name="descripcion"
                        value={indicio.descripcion}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 px-3 py-2 rounded-md"
                    />
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block font-medium text-gray-700">Color</label>
                        <input
                            type="text"
                            name="color"
                            value={indicio.color}
                            onChange={handleChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700">Tamaño</label>
                        <input
                            type="text"
                            name="tamaño"
                            value={indicio.tamaño}
                            onChange={handleChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded-md"
                        />
                    </div>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block font-medium text-gray-700">Peso</label>
                        <input
                            type="text"
                            name="peso"
                            value={indicio.peso}
                            onChange={handleChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700">Ubicación</label>
                        <input
                            type="text"
                            name="ubicacion"
                            value={indicio.ubicacion}
                            onChange={handleChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded-md"
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block font-medium text-gray-700">Técnico que registra</label>
                    <input
                        type="text"
                        name="tecnico"
                        value={indicio.tecnico}
                        readOnly
                        className="w-full bg-gray-100 border border-gray-300 px-3 py-2 rounded-md"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 transition-all"
                >
                    Guardar Indicio
                </button>
            </form>
        </div>
    );
};

export default IndicioForm;
