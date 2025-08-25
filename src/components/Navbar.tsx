import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';

const Navbar = () => {
    const [ isOpen, setIsOpen ] = useState(false);
    const [ isDropdownOpen, setIsDropdownOpen ] = useState(false);
    const { isAuthenticated, logout, rol } = useAuth();
    const navigate = useNavigate();

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-blue-800 text-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">API- Sistema de Gestiones</h1>

                {/* Botón hamburguesa */}
                <div className="md:hidden">
                    <button onClick={toggleMenu}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Menú en escritorio */}
                <ul className="hidden md:flex gap-4 text-sm items-center">
                    {isAuthenticated && (
                        <li><Link to="/" className="px-3 py-2 rounded hover:bg-blue-700">Inicio</Link></li>
                    )}

                    {isAuthenticated && rol !== 'coordinador' && (
                        <>
                            <li><Link to="/expediente" className="px-3 py-2 rounded hover:bg-blue-700">Registro de Expedientes</Link></li>
                            <li><Link to="/indicio" className="px-3 py-2 rounded hover:bg-blue-700">Registro de Indicios</Link></li>
                        </>
                    )}

                    {isAuthenticated && rol === 'coordinador' && (
                        <li><Link to="/revisar" className="px-3 py-2 rounded hover:bg-blue-700">Revisar Expedientes</Link></li>
                    )}

                    {isAuthenticated && (
                        <li className="relative group">
                            <button className="px-3 py-2 rounded hover:bg-blue-700">
                                Informes y Estadísticas
                            </button>
                            <ul className="absolute left-0 mt-2 w-48 bg-white text-black shadow-lg rounded z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <li>
                                    <Link
                                        to="/reporte-expedientes"
                                        className="block px-4 py-2 hover:bg-gray-200"
                                    >
                                        Reporte de Expedientes
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/reporte-indicios"
                                        className="block px-4 py-2 hover:bg-gray-200"
                                    >
                                        Reporte de Indicios
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/reporte-aprobaciones"
                                        className="block px-4 py-2 hover:bg-gray-200"
                                    >
                                        Reporte de Aprobaciones y Rechazos
                                    </Link>
                                </li>
                            </ul>
                        </li>
                    )}

                    {isAuthenticated && (
                        <li>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded text-white"
                            >
                                Cerrar sesión
                            </button>
                        </li>
                    )}

                    {!isAuthenticated && (
                        <li>
                            <Link
                                to="/login"
                                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
                            >
                                Iniciar sesión
                            </Link>
                        </li>
                    )}
                </ul>
            </div>

            {/* Menú móvil */}
            {isOpen && (
                <ul className="md:hidden px-4 pb-4 text-sm space-y-2 bg-blue-700">
                    {isAuthenticated && (
                        <li><Link to="/" onClick={toggleMenu} className="block py-2">Inicio</Link></li>
                    )}

                    {isAuthenticated && rol !== 'coordinador' && (
                        <>
                            <li><Link to="/expediente" onClick={toggleMenu} className="block py-2">Registro de Expedientes</Link></li>
                            <li><Link to="/indicio" onClick={toggleMenu} className="block py-2">Registro de Indicios</Link></li>
                        </>
                    )}

                    {isAuthenticated && rol === 'coordinador' && (
                        <li><Link to="/revisar" onClick={toggleMenu} className="block py-2">Revisar Expedientes</Link></li>
                    )}

                    {isAuthenticated && (
                        <li>
                            <button
                                onClick={() => {
                                    toggleMenu();
                                    handleLogout();
                                }}
                                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded"
                            >
                                Cerrar sesión
                            </button>
                        </li>
                    )}

                    {!isAuthenticated && (
                        <li>
                            <Link
                                to="/login"
                                onClick={toggleMenu}
                                className="block bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-center"
                            >
                                Iniciar sesión
                            </Link>
                        </li>
                    )}

                    {isAuthenticated && (
                        <li>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="block w-full text-left py-2 hover:bg-blue-600"
                            >
                                Informes y Estadísticas
                            </button>
                            {isDropdownOpen && (
                                <ul className="pl-4 space-y-2 z-10">
                                    <li>
                                        <Link
                                            to="/reporte-expedientes"
                                            onClick={toggleMenu}
                                            className="block py-2 hover:bg-blue-600"
                                        >
                                            Reporte de Expedientes
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/reporte-indicios"
                                            onClick={toggleMenu}
                                            className="block py-2 hover:bg-blue-600"
                                        >
                                            Reporte de Indicios
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/reporte-aprobaciones"
                                            onClick={toggleMenu}
                                            className="block py-2 hover:bg-blue-600"
                                        >
                                            Reporte de Aprobaciones y Rechazos
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>
                    )}
                </ul>
            )}
        </nav>
    );
};

export default Navbar;