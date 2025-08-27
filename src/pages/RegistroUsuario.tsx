import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../auth/useAuth';

type Usuario = {
  id: number;
  nombre: string;
  email: string;
  rol: 'coordinador' | 'tecnico' | 'usuario' | string;
  activo: boolean | number;
  creado_en?: string | null;
  actualizado_en?: string | null;
};

type ListResponse = {
  page: number;
  pageSize: number;
  total: number;
  data: Usuario[];
};

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export default function RegistroUsuario() {
  const navigate = useNavigate();
  const { token, rol } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Usuario[]>([]);
  const [total, setTotal] = useState(0);

  const q = searchParams.get('q') ?? '';
  const page = Number(searchParams.get('page') ?? '1');
  const pageSize = Number(searchParams.get('pageSize') ?? '10');
  const activo = searchParams.get('activo'); // 'true' | 'false' | null

  const canCreate = rol === 'coordinador';

  const params = useMemo(() => {
    const p: Record<string, string> = {
      page: String(Math.max(1, page)),
      pageSize: String(Math.max(1, Math.min(200, pageSize))),
    };
    if (q.trim()) p.q = q.trim();
    if (activo === 'true' || activo === 'false') p.activo = activo;
    return p;
  }, [q, page, pageSize, activo]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = new URL('/usuarios', API);
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
      const res = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ListResponse = await res.json();
      setRows(json.data ?? []);
      setTotal(json.total ?? 0);
    } catch (err) {
      console.error(err);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, page, pageSize, activo]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const updateParam = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null || v === '') next.delete(k);
      else next.set(k, v);
    });
    // reset page when filters change
    if (updates.q !== undefined || updates.activo !== undefined || updates.pageSize !== undefined) {
      next.set('page', '1');
    }
    setSearchParams(next);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Buscar por nombre o email…"
            className="input input-bordered px-3 py-2 rounded border border-gray-300"
            value={q}
            onChange={(e) => updateParam({ q: e.target.value })}
          />
          <select
            className="px-3 py-2 rounded border border-gray-300"
            value={activo ?? ''}
            onChange={(e) => updateParam({ activo: e.target.value || null })}
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
          <select
            className="px-3 py-2 rounded border border-gray-300"
            value={String(pageSize)}
            onChange={(e) => updateParam({ pageSize: e.target.value })}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>{n}/página</option>
            ))}
          </select>
          {canCreate && (
            <button
              onClick={() => navigate('/usuarios/crear')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Crear usuario
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-2">Nombre</th>
              <th className="text-left px-4 py-2">Email</th>
              <th className="text-left px-4 py-2">Rol</th>
              <th className="text-left px-4 py-2">Activo</th>
              <th className="text-left px-4 py-2">Creado</th>
              <th className="text-left px-4 py-2">Actualizado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center">Cargando…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center">Sin resultados</td></tr>
            ) : (
              rows.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-2">{u.nombre}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2 capitalize">{u.rol}</td>
                  <td className="px-4 py-2">
                    {Number(u.activo) === 1 || u.activo === true ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-green-100 text-green-700">Sí</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-100 text-red-700">No</span>
                    )}
                  </td>
                  <td className="px-4 py-2">{u.creado_en ? new Date(u.creado_en).toLocaleString() : '-'}</td>
                  <td className="px-4 py-2">{u.actualizado_en ? new Date(u.actualizado_en).toLocaleString() : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Total: <strong>{total}</strong> • Página {page} de {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded border disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => updateParam({ page: String(page - 1) })}
          >
            Anterior
          </button>
          <button
            className="px-3 py-1 rounded border disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => updateParam({ page: String(page + 1) })}
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Enlace alternativo para crear (por accesibilidad) */}
      {canCreate && (
        <div className="mt-6">
          <Link to="/usuarios/crear" className="text-blue-600 hover:underline">
            + Crear nuevo usuario
          </Link>
        </div>
      )}
    </div>
  );
}
