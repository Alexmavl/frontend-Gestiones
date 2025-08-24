import { useState } from 'react';
import AuthContext from './AuthContext';
import type { Rol } from './AuthContext';

interface Props {
    children: React.ReactNode;
}

const AuthProvider = ({ children }: Props) => {
    const [ token, setToken ] = useState<string | null>(localStorage.getItem('token'));
    const [ rol, setRol ] = useState<Rol | null>(localStorage.getItem('rol') as Rol | null);
    const [ username, setUsername ] = useState<string | null>(localStorage.getItem('username'));
    const [ id, setId ] = useState<string | null>(localStorage.getItem('id'));

    const isAuthenticated = !!token;

    const login = async (username: string, password: string): Promise<void> => {
        const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, id }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al iniciar sesión');
        }

        const data = await response.json();

        setToken(data.token);
        setRol(data.user.rol);
        setUsername(data.user.username);
        setId(data.user.id);

        localStorage.setItem('token', data.token);
        localStorage.setItem('rol', data.user.rol);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('id', data.user.id);
    };

    const logout = (): void => {
        setToken(null);
        setRol(null);
        setUsername(null);
        setId(null);

        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        localStorage.removeItem('username');
        localStorage.removeItem('id');
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
