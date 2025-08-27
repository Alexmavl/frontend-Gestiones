// src/pages/RevisarExpedientes.tsx
import { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import useAuth from "../auth/useAuth";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";

interface Indicio {
  id: number;
  descripcion: string | null;
  color: string | null;
  tamano: string | null;
  peso: number | null;
  ubicacion: string | null;
  tecnico_id?: number;
}

type Estado = "pendiente" | "aprobado" | "rechazado";

interface Expediente {
  id?: number; // opcional si tu API no lo envía
  codigo: string;
  fecha_registro: string | null;
  tecnico_username: string;
  tecnico_id: number;
  estado: Estado;
  descripcion?: string | null;
  justificacion?: string;
  aprobador_id?: number | null;
  aprobador_username?: string | null;
  fecha_estado?: string | null;
  indicios: Indicio[];
}

const API_BASE = "http://localhost:3000";

const RevisarExpedientes = () => {
  const { token, id: userId, username: userUsername } = useAuth();

  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [rechazoJustificacion, setRechazoJustificacion] = useState("");
  const [expedienteRechazando, setExpedienteRechazando] = useState<string | null>(null); // por código
  const [refreshing, setRefreshing] = useState(false);

  // Helpers
  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    [token]
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  // Cargar expedientes + sus indicios (por código)
  const fetchExpedientes = async () => {
    setLoading(true);
    try {
      const expRes = await fetch(`${API_BASE}/expedientes`, {
        headers: authHeaders,
      });
      if (!expRes.ok) throw new Error("No se pudo obtener expedientes");
      const raw = await expRes.json();

      // Ajusta aquí si tu API devuelve {data: [...]}
      const base: Expediente[] = Array.isArray(raw) ? raw : raw?.data ?? [];

      // Traer indicios por código (paginado 50)
      const withIndicios: Expediente[] = await Promise.all(
        base.map(async (exp) => {
          const url = new URL(
            `${API_BASE}/Expedientes/${encodeURIComponent(exp.codigo)}/Indicios`
          );
          url.searchParams.set("q", "");
          url.searchParams.set("page", "1");
          url.searchParams.set("pageSize", "50");

          try {
            const indRes = await fetch(url.toString(), { headers: authHeaders });
            const j = await indRes.json();
            const rows: Indicio[] = Array.isArray(j) ? j : j?.data ?? [];
            return { ...exp, indicios: rows };
          } catch {
            return { ...exp, indicios: [] };
          }
        })
      );

      setExpedientes(withIndicios);
    } catch (e) {
      console.error(e);
      setExpedientes([]);
      await Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los expedientes.",
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchExpedientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const EstadoChip = ({ value }: { value: Estado }) => {
    const map = {
      aprobado: "bg-emerald-50 text-emerald-700 border-emerald-200",
      rechazado: "bg-rose-50 text-rose-700 border-rose-200",
      pendiente: "bg-amber-50 text-amber-700 border-amber-200",
    } as const;
    return (
      <span className={`text-xs px-2.5 py-1 rounded-full border ${map[value]}`}>
        {value.toUpperCase()}
      </span>
    );
  };

  const aprobarExpediente = async (codigo: string) => {
    if (!userId) {
      await Swal.fire({
        title: "Sesión requerida",
        text: "No se detectó el usuario aprobador. Vuelve a iniciar sesión.",
        icon: "warning",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "Aprobar expediente",
      text: `¿Confirmas aprobar el expediente ${codigo}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, aprobar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#10b981",
    });
    if (!confirm.isConfirmed) return;

    try {
      const resp = await fetch(`${API_BASE}/expedientes/${encodeURIComponent(codigo)}/estado`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ estado: "aprobado", justificacion: "" }),
      });

      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j?.message || "No se pudo aprobar");
      }

      setExpedientes((prev) =>
        prev.map((e) =>
          e.codigo === codigo
            ? {
                ...e,
                estado: "aprobado",
                justificacion: "",
                aprobador_id: Number(userId),
                aprobador_username: userUsername,
                fecha_estado: new Date().toISOString(),
              }
            : e
        )
      );

      await Swal.fire({
        title: "Aprobado",
        text: `El expediente ${codigo} fue aprobado.`,
        icon: "success",
        confirmButtonText: "Listo",
        confirmButtonColor: "#10b981",
        timer: 1600,
        timerProgressBar: true,
      });
    } catch (error: any) {
      await Swal.fire({
        title: "Error",
        text: error?.message || "Ocurrió un error al aprobar.",
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const prepararRechazo = (codigo: string) => {
    setExpedienteRechazando(codigo);
    setRechazoJustificacion("");
  };

  const confirmarRechazo = async () => {
    const codigo = expedienteRechazando;
    if (!codigo) return;

    if (!rechazoJustificacion.trim()) {
      await Swal.fire({
        title: "Falta justificación",
        text: "Debes ingresar una justificación para rechazar.",
        icon: "warning",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }
    if (!userId) {
      await Swal.fire({
        title: "Sesión requerida",
        text: "No se detectó el usuario aprobador. Vuelve a iniciar sesión.",
        icon: "warning",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    try {
      const resp = await fetch(`${API_BASE}/expedientes/${encodeURIComponent(codigo)}/estado`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ estado: "rechazado", justificacion: rechazoJustificacion }),
      });

      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j?.message || "No se pudo rechazar");
      }

      setExpedientes((prev) =>
        prev.map((e) =>
          e.codigo === codigo
            ? {
                ...e,
                estado: "rechazado",
                justificacion: rechazoJustificacion,
                aprobador_id: Number(userId),
                aprobador_username: userUsername,
                fecha_estado: new Date().toISOString(),
              }
            : e
        )
      );

      await Swal.fire({
        title: "Rechazado",
        text: `El expediente ${codigo} fue rechazado.`,
        icon: "success",
        confirmButtonText: "Listo",
        confirmButtonColor: "#10b981",
        timer: 1600,
        timerProgressBar: true,
      });
    } catch (error: any) {
      await Swal.fire({
        title: "Error",
        text: error?.message || "Ocurrió un error al rechazar.",
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setExpedienteRechazando(null);
      setRechazoJustificacion("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] grid place-items-center">
        <div className="flex items-center gap-3 text-blue-700">
          <ArrowPathIcon className="h-6 w-6 animate-spin" />
          Cargando expedientes…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 text-white flex items-center justify-between">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <ClipboardDocumentListIcon className="h-8 w-8" />
              Revisión de Expedientes
            </h2>
            <button
              onClick={() => {
                setRefreshing(true);
                fetchExpedientes();
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition flex items-center gap-2"
              title="Actualizar"
            >
              <ArrowPathIcon className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
              Actualizar
            </button>
          </div>

          {/* Lista */}
          <div className="p-6 space-y-6">
            {expedientes.length === 0 ? (
              <div className="text-center text-gray-600 py-12">
                <ExclamationTriangleIcon className="h-10 w-10 mx-auto text-amber-500 mb-2" />
                No hay expedientes para revisar.
              </div>
            ) : (
              expedientes.map((expediente) => (
                <div
                  key={expediente.codigo}
                  className="relative p-5 border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition"
                >
                  {/* Estado a la derecha */}
                  <div className="absolute top-5 right-5 flex items-center gap-3">
                    <EstadoChip value={expediente.estado} />
                  </div>

                  <h3 className="text-xl font-semibold text-gray-800">
                    Expediente: <span className="text-blue-700">{expediente.codigo}</span>
                  </h3>
                  <div className="mt-1 text-sm text-gray-600">
                    <p>Fecha de registro: {formatDate(expediente.fecha_registro)}</p>
                    <p>Técnico: {expediente.tecnico_username}</p>
                    {expediente.descripcion && <p>Descripción: {expediente.descripcion}</p>}
                    {expediente.aprobador_username && <p>Aprobador: {expediente.aprobador_username}</p>}
                    {expediente.fecha_estado && <p>Fecha cambio estado: {formatDate(expediente.fecha_estado)}</p>}
                  </div>

                  {/* Justificación si fue rechazado */}
                  {expediente.estado === "rechazado" && expediente.justificacion && (
                    <div className="mt-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
                      <span className="font-semibold">Justificación:</span> {expediente.justificacion}
                    </div>
                  )}

                  {/* Indicios */}
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Indicios</h4>
                    <ul className="pl-5 list-disc text-sm text-gray-700">
                      {expediente.indicios?.length ? (
                        expediente.indicios.map((indicio) => (
                          <li key={indicio.id}>
                            <strong>{indicio.descripcion || "Sin descripción"}</strong>
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
                  </div>

                  {/* Acciones */}
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={() => aprobarExpediente(expediente.codigo)}
                      disabled={expediente.estado === "aprobado"}
                      className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl font-semibold transition ${
                        expediente.estado === "aprobado"
                          ? "bg-emerald-100 text-emerald-500 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow"
                      }`}
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                      Aprobar
                    </button>

                    <button
                      onClick={() => prepararRechazo(expediente.codigo)}
                      disabled={expediente.estado === "rechazado"}
                      className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl font-semibold transition ${
                        expediente.estado === "rechazado"
                          ? "bg-rose-100 text-rose-500 cursor-not-allowed"
                          : "bg-rose-600 hover:bg-rose-700 text-white shadow"
                      }`}
                    >
                      <XCircleIcon className="h-5 w-5" />
                      Rechazar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de rechazo */}
      {expedienteRechazando && (
        <div className="fixed inset-0 z-[9999]">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setExpedienteRechazando(null)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">Justificación del Rechazo</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Expediente: <span className="font-semibold">{expedienteRechazando}</span>
                </p>
              </div>
              <div className="p-6">
                <textarea
                  value={rechazoJustificacion}
                  onChange={(e) => setRechazoJustificacion(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe el motivo del rechazo…"
                />
                <div className="mt-5 flex justify-end gap-3">
                  <button
                    onClick={() => setExpedienteRechazando(null)}
                    className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarRechazo}
                    disabled={!rechazoJustificacion.trim()}
                    className="px-5 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 disabled:opacity-50"
                  >
                    Confirmar Rechazo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevisarExpedientes;
