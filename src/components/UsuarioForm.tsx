// src/components/UsuarioForm.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import type { FormEvent } from 'react'; // ⬅️ tipo-only import obligatorio


const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

type Rol = 'coordinador' | 'tecnico' | 'usuario';

export default function UsuarioForm() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState<Rol>('usuario');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canSubmit =
    nombre.trim().length >= 2 &&
    /\S+@\S+\.\S+/.test(email) &&
    password.length >= 6;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${API}/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ nombre: nombre.trim(), email: email.trim(), rol, password }),
      });

      if (res.status === 409) {
        setErrorMsg('El email ya existe.');
        return;
      }

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || `Error HTTP ${res.status}`);
      }

      // Éxito
      navigate('/usuarios');
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Error creando usuario');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded shadow p-6">
      <h1 className="text-2xl font-bold mb-4">Crear usuario</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre completo"
            required
            minLength={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@dominio.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Rol</label>
          <select
            className="w-full px-3 py-2 border rounded"
            value={rol}
            onChange={(e) => setRol(e.target.value as Rol)}
          >
            <option value="usuario">Usuario</option>
            <option value="tecnico">Técnico</option>
            <option value="coordinador">Coordinador</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contraseña</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
          />
        </div>

        {errorMsg && (
          <div className="text-red-600 text-sm">{errorMsg}</div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-blue-700"
          >
            {submitting ? 'Guardando…' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/usuarios')}
            className="px-4 py-2 rounded border"
          >
            Cancelar
          </button>
        </div>
      </form>

      <p className="mt-4 text-xs text-gray-500">
        * El usuario se crea activo por defecto (según tu SP).
      </p>
    </div>
  );
}
