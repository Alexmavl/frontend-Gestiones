import { useState } from 'react';
import AuthContext from './AuthContext';
import type { Rol } from './AuthContext';

interface Props {
  children: React.ReactNode;
}

type LoginResponse = {
  token: string;
  usuario: {
    id: number | string;
    nombre: string;
    email: string;
    rol: 'tecnico' | 'coordinador';
  };
};

// Valida rol permitido para evitar valores raros
const asRol = (v: unknown): Rol => (v === 'tecnico' || v === 'coordinador' ? v : null);

const AuthProvider = ({ children }: Props) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [rol, setRol] = useState<Rol>(asRol(localStorage.getItem('rol')));
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));
  const [id, setId] = useState<string | null>(localStorage.getItem('id'));

  const isAuthenticated = !!token;

  const clearAll = () => {
    setToken(null);
    setRol(null);
    setUsername(null);
    setId(null);
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('username');
    localStorage.removeItem('id');
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const resp = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data: Partial<LoginResponse> & { message?: string } =
        await resp.json().catch(() => ({} as any));

      if (!resp.ok) {
        // Propaga mensaje del backend (404, 401, 500, etc.)
        throw new Error(data?.message ?? 'Error al iniciar sesión');
      }

      if (!data?.token || !data?.usuario) {
        throw new Error('Respuesta inválida del servidor (faltan token o usuario).');
      }

      const u = data.usuario;
      const rolOk = asRol(u.rol);

      // Estado
      setToken(data.token);
      setRol(rolOk);
      setUsername(u.nombre ?? null);
      setId(String(u.id));

      // Storage
      localStorage.setItem('token', data.token);
      rolOk ? localStorage.setItem('rol', rolOk) : localStorage.removeItem('rol');
      u.nombre ? localStorage.setItem('username', u.nombre) : localStorage.removeItem('username');
      localStorage.setItem('id', String(u.id));
    } catch (err) {
      clearAll();
      throw err;
    }
  };

  const logout = (): void => {
    clearAll();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        rol,
        username,
        id,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
