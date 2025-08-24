import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';

const ExpedienteForm = () => {
    const { token, username, id } = useAuth();
    const navigate = useNavigate();

    const [ expediente, setExpediente ] = useState({
        codigo: '',
        descripcion: ''
    });

    const [ feedback, setFeedback ] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setExpediente(prev => ({ ...prev, [ name ]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);

        if (!expediente.codigo || !expediente.descripcion) {
            setFeedback({ type: 'error', message: 'Todos los campos son obligatorios' });
            return;
        }

        try {
            const payload = {
                codigo: expediente.codigo,
                descripcion: expediente.descripcion,
                tecnico_id: id
            };

            const response = await fetch('http://localhost:3001/api/expedientes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al registrar expediente');
            }

            alert('Expediente registrado correctamente.');
            navigate('/expediente');

            setExpediente({
                codigo: '',
                descripcion: ''
            });

        } catch (error: unknown) {
            console.error(error);
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
                onClick={() => navigate('/expediente')}
                className="bg-gray-200 text-blue-700 px-4 py-2 rounded hover:bg-gray-300 transition-all mb-4"
            >
                ← Volver a Registro de Expedientes
            </button>
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-md mt-8">
                <h2 className="text-2xl font-semibold mb-4 text-blue-800">Registrar Expediente</h2>

                {feedback && (
                    <p className={`mb-4 ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {feedback.message}
                    </p>
                )}

                <div className="mb-4">
                    <label className="block font-medium text-gray-700">Código de expediente</label>
                    <input
                        type="text"
                        name="codigo"
                        value={expediente.codigo}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                    />
                </div>

                <div className="mb-4">
                    <label className="block font-medium text-gray-700">Descripción</label>
                    <textarea
                        name="descripcion"
                        value={expediente.descripcion}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 px-3 py-2 rounded-md"
                        rows={3}
                    />
                </div>

                {/* Campos predeterminados/automáticos solo visuales */}
                <div className="mb-4">
                    <label className="block font-medium text-gray-700">Fecha de registro (automática)</label>
                    <input
                        type="text"
                        value={new Date().toLocaleDateString()}
                        readOnly
                        className="w-full bg-gray-100 border border-gray-300 px-3 py-2 rounded-md"
                    />
                </div>
                <div className="mb-4">
                    <label className="block font-medium text-gray-700">Estado (predeterminado)</label>
                    <input
                        type="text"
                        value="pendiente"
                        readOnly
                        className="w-full bg-gray-100 border border-gray-300 px-3 py-2 rounded-md"
                    />
                </div>
                <div className="mb-4">
                    <label className="block font-medium text-gray-700">Activo (predeterminado)</label>
                    <input
                        type="text"
                        value="Sí"
                        readOnly
                        className="w-full bg-gray-100 border border-gray-300 px-3 py-2 rounded-md"
                    />
                </div>

                <div className="mb-6">
                    <label className="block font-medium text-gray-700">Técnico que registra</label>
                    <input
                        type="text"
                        value={username || ''}
                        readOnly
                        className="w-full bg-gray-100 border border-gray-300 px-3 py-2 rounded-md"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 transition-all"
                >
                    Guardar Expediente
                </button>
            </form>
        </div>
    );
};

export default ExpedienteForm;
