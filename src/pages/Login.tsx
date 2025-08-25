import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";
import {
  FiUser,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiLogIn,
} from "react-icons/fi";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Por favor completa usuario y contraseña.");
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      navigate("/");
    } catch (err: unknown) {
      if (err instanceof Error && err.message) setError(err.message);
      else setError("No se pudo iniciar sesión. Verifica tus credenciales.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-transparent">
      <div className="w-full max-w-md">
        {/* Tarjeta limpia, sin fondo global */}
        <div className="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
          {/* Encabezado */}
          <div className="px-8 pt-8 pb-4 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
              <FiLogIn className="h-6 w-6 text-cyan-700" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-800">
              Iniciar sesión
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Sistema Gestiones 
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mx-8 mb-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200"
              role="alert"
              aria-live="assertive"
            >
              <FiAlertCircle className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="px-8 pb-8">
            {/* Usuario */}
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Usuario
            </label>
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-300">
              <FiUser className="text-cyan-700" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent placeholder-gray-400 text-gray-900 outline-none"
                placeholder="correo@empresa.com"
                autoComplete="username"
                required
              />
            </div>

            {/* Contraseña */}
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-300">
              <FiLock className="text-cyan-600" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent placeholder-gray-400 text-gray-900 outline-none"
                placeholder="Tu contraseña"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="rounded-md p-1 hover:bg-gray-100 active:scale-95 transition"
                aria-label={
                  showPass ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPass ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

          

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="group relative inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white shadow-md ring-1 ring-cyan-500/50 transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Ingresando...
                </>
              ) : (
                <>
                  <FiLogIn className="transition group-active:-translate-x-0.5" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>
        </div>

        {/* Pie opcional */}
        <p className="mt-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} · Proyecto de Desarrollo Web - UMG
        </p>
      </div>
    </div>
  );
};

export default Login;
