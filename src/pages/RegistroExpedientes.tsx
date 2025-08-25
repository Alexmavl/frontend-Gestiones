// src/pages/RegistroExpedientes.tsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";
import { PlusIcon, PencilIcon } from "@heroicons/react/24/solid";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

type Estado = "pendiente" | "aprobado" | "rechazado";

interface Expediente {
  id: number;
  codigo: string;
  descripcion: string;
  fecha_registro: string | null;
  tecnico_id: number;
  justificacion?: string | null;
  estado: Estado;
  aprobador_id?: number | null;
  fecha_estado?: string | null;
  activo: boolean;
}

const API = "http://localhost:3000";
const LIST_PATH = "/Expedientes"; // tu endpoint de listado (con E mayúscula)
const BY_CODE_PATH = "/expedientes"; // endpoints por código (minúscula, según tus rutas)

// ---- Toggle (botón deslizable) ----
type ToggleProps = {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label?: string;
};
const Toggle = ({ checked, onChange, disabled, label }: ToggleProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label ?? "Cambiar activo"}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${checked ? "bg-green-600" : "bg-gray-300"}
      `}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition
          ${checked ? "translate-x-5" : "translate-x-1"}
        `}
      />
    </button>
  );
};

const RegistroExpediente = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expediente | null>(null);
  const [codigoLookup, setCodigoLookup] = useState<string | null>(null);

  // control de "busy" por código para deshabilitar el toggle mientras actualiza
  const [toggling, setToggling] = useState<Record<string, boolean>>({});

  const normalizeExp = (r: any): Expediente => ({
    id: Number(r.id),
    codigo: String(r.codigo ?? ""),
    descripcion: String(r.descripcion ?? ""),
    fecha_registro: r.fecha_registro ?? null,
    tecnico_id: Number(r.tecnico_id ?? 0),
    justificacion: r.justificacion ?? null,
    estado: (r.estado ?? "pendiente") as Estado,
    aprobador_id: r.aprobador_id ?? null,
    fecha_estado: r.fecha_estado ?? null,
    activo: r.activo === true || r.activo === 1 || r.activo === "1",
  });

  const fetchExpedientes = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const url = new URL(`${API}${LIST_PATH}`);
      url.searchParams.set("page", "1");
      url.searchParams.set("pageSize", "50");

      const resp = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(json?.message ?? "No se pudo listar");

      const rows: any[] = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.rows)
        ? json.rows
        : [];

      setExpedientes(rows.map(normalizeExp));
    } catch (e) {
      console.error("Error al obtener expedientes:", e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchExpedientes();
  }, [fetchExpedientes]);

  const openModal = (exp: Expediente) => {
    setEditing({ ...exp });
    setCodigoLookup(exp.codigo);
    setModalOpen(true);
  };

  const closeModal = () => {
    setEditing(null);
    setCodigoLookup(null);
    setModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editing || !codigoLookup) return;
    try {
      const resp = await fetch(
        `${API}${BY_CODE_PATH}/${encodeURIComponent(codigoLookup)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            codigo: editing.codigo,
            descripcion: editing.descripcion,
          }),
        }
      );
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok)
        throw new Error(json?.message ?? "Error al guardar expediente");

      closeModal();
      await Swal.fire({
        title: "Cambios guardados",
        text: `El expediente ${editing.codigo} fue actualizado correctamente.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchExpedientes();
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        text: error?.message ?? "Ocurrió un error al guardar el expediente.",
        icon: "error",
      });
    }
  };

  const handleToggleActivo = async (exp: Expediente) => {
    if (!token) return;

    try {
      // si está activo -> confirmar desactivación
      if (exp.activo) {
        const { isConfirmed } = await Swal.fire({
          title: "Desactivar expediente",
          text: `¿Estás seguro de desactivar el expediente ${exp.codigo}? Podrás activarlo nuevamente cuando lo requieras.`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, desactivar",
          cancelButtonText: "Cancelar",
          reverseButtons: true,
          focusCancel: true,
          confirmButtonColor: "#ea580c",
          cancelButtonColor: "#6b7280",
        });
        if (!isConfirmed) return;
      }

      setToggling((p) => ({ ...p, [exp.codigo]: true }));

      const resp = await fetch(
        `${API}${BY_CODE_PATH}/${encodeURIComponent(exp.codigo)}/activo`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({ activo: !exp.activo }),
        }
      );
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok)
        throw new Error(json?.message ?? "No se pudo cambiar el estado");

      // feedback profesional según acción
      await Swal.fire({
        title: exp.activo ? "Expediente desactivado" : "Expediente activado",
        text: `El expediente ${exp.codigo} se ${
          exp.activo ? "desactivó" : "activó"
        } correctamente.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchExpedientes();
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        text:
          error?.message ??
          "Ocurrió un error al cambiar el estado del expediente.",
        icon: "error",
      });
    } finally {
      setToggling((p) => ({ ...p, [exp.codigo]: false }));
    }
  };

  if (loading)
    return <div className="text-center mt-6">Cargando expedientes...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-blue-800 mb-6">
        Gestión de Expedientes
      </h2>

      <button
        onClick={() => navigate("/expediente-form")}
        className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 mb-4 flex items-center gap-2"
      >
        <PlusIcon className="h-5 w-5" />
        Agregar Expediente
      </button>

      {expedientes.length === 0 ? (
        <div className="text-center text-gray-600 mt-4">
          No existen registros de expedientes.
        </div>
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
            {expedientes.map((exp, index) => (
              <tr
                key={exp.id}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-gray-100`}
              >
                <td className="border border-gray-300 px-4 py-2">
                  {exp.codigo}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {exp.descripcion}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {exp.estado}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <Toggle
                    checked={exp.activo}
                    onChange={() => handleToggleActivo(exp)}
                    disabled={!!toggling[exp.codigo]}
                    label={`Alternar activo para ${exp.codigo}`}
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <button
                    onClick={() => exp.activo && openModal(exp)}
                    className={`bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2 flex items-center gap-2 ${
                      !exp.activo ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={!exp.activo}
                    title={
                      exp.activo
                        ? ""
                        : "Para editar, el registro debe estar activo"
                    }
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

      {modalOpen && editing && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Editar Expediente</h3>
            <form onSubmit={handleSave}>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">
                  Código
                </label>
                <input
                  type="text"
                  value={editing.codigo}
                  onChange={(e) =>
                    setEditing({ ...editing, codigo: e.target.value })
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded-md"
                  required
                />
                {codigoLookup && codigoLookup !== editing.codigo && (
                  <p className="text-xs text-gray-500 mt-1">
                    Se actualizará el registro cuyo código actual es{" "}
                    <b>{codigoLookup}</b>.
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  value={editing.descripcion}
                  onChange={(e) =>
                    setEditing({ ...editing, descripcion: e.target.value })
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
