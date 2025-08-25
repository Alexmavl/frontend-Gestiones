import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import {
  HomeIcon,
  FolderPlusIcon,
  BeakerIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  ClipboardDocumentListIcon,
  ChartPieIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/solid';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isAuthenticated, logout, rol } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const Item = ({
    to,
    icon,
    children,
  }: {
    to: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <li>
      <Link to={to} className="px-3 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
        {icon}
        <span>{children}</span>
      </Link>
    </li>
  );

  return (
    <nav className="bg-blue-500 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <ChartBarIcon className="w-6 h-6" />
          API- Sistema de Gestiones
        </h1>

        {/* Botón hamburguesa */}
        <div className="md:hidden">
          <button onClick={toggleMenu} aria-label="Abrir menú">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Menú escritorio */}
        <ul className="hidden md:flex gap-2 text-sm items-center">
          {isAuthenticated && (
            <Item to="/" icon={<HomeIcon className="w-5 h-5" />}>Inicio</Item>
          )}

          {isAuthenticated && rol !== 'coordinador' && (
            <>
              <Item to="/expediente" icon={<FolderPlusIcon className="w-5 h-5" />}>
                Registro de Expedientes
              </Item>
              <Item to="/indicio" icon={<BeakerIcon className="w-5 h-5" />}>
                Registro de Indicios
              </Item>
            </>
          )}

          {isAuthenticated && rol === 'coordinador' && (
            <Item to="/revisar" icon={<ClipboardDocumentCheckIcon className="w-5 h-5" />}>
              Revisar Expedientes
            </Item>
          )}

          {isAuthenticated && (
            <li className="relative group">
              <button className="px-3 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5" />
                Informes y Estadísticas
                <ChevronDownIcon className="w-4 h-4 opacity-80" />
              </button>
              <ul className="absolute left-0 mt-2 w-64 bg-white text-black shadow-lg rounded z-10 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                <li>
                  <Link
                    to="/reporte-expedientes"
                    className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
                  >
                    <DocumentChartBarIcon className="w-5 h-5 text-blue-600" />
                    Reporte de Expedientes
                  </Link>
                </li>
                <li>
                  <Link
                    to="/reporte-indicios"
                    className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
                  >
                    <ClipboardDocumentListIcon className="w-5 h-5 text-emerald-600" />
                    Reporte de Indicios
                  </Link>
                </li>
                <li>
                  <Link
                    to="/reporte-aprobaciones"
                    className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
                  >
                    <ChartPieIcon className="w-5 h-5 text-purple-600" />
                    Reporte de Aprobaciones y Rechazos
                  </Link>
                </li>
              </ul>
            </li>
          )}

          {/* Solo cerrar sesión (quitar iniciar sesión) */}
          {isAuthenticated && (
            <li>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded text-white flex items-center gap-2"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                Cerrar sesión
              </button>
            </li>
          )}
        </ul>
      </div>

      {/* Menú móvil */}
      {isOpen && (
        <ul className="md:hidden px-4 pb-4 text-sm space-y-2 bg-blue-700">
          {isAuthenticated && (
            <li>
              <Link to="/" onClick={toggleMenu} className="flex items-center gap-2 py-2">
                <HomeIcon className="w-5 h-5" />
                Inicio
              </Link>
            </li>
          )}

          {isAuthenticated && rol !== 'coordinador' && (
            <>
              <li>
                <Link to="/expediente" onClick={toggleMenu} className="flex items-center gap-2 py-2">
                  <FolderPlusIcon className="w-5 h-5" />
                  Registro de Expedientes
                </Link>
              </li>
              <li>
                <Link to="/indicio" onClick={toggleMenu} className="flex items-center gap-2 py-2">
                  <BeakerIcon className="w-5 h-5" />
                  Registro de Indicios
                </Link>
              </li>
            </>
          )}

          {isAuthenticated && rol === 'coordinador' && (
            <li>
              <Link to="/revisar" onClick={toggleMenu} className="flex items-center gap-2 py-2">
                <ClipboardDocumentCheckIcon className="w-5 h-5" />
                Revisar Expedientes
              </Link>
            </li>
          )}

          {isAuthenticated && (
            <li>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 w-full text-left py-2 hover:bg-blue-600 rounded"
              >
                <ChartBarIcon className="w-5 h-5" />
                Informes y Estadísticas
                <ChevronDownIcon className="w-4 h-4 ml-auto" />
              </button>
              {isDropdownOpen && (
                <ul className="pl-4 space-y-1 z-10">
                  <li>
                    <Link
                      to="/reporte-expedientes"
                      onClick={toggleMenu}
                      className="flex items-center gap-2 py-2 hover:bg-blue-600 rounded"
                    >
                      <DocumentChartBarIcon className="w-5 h-5 text-blue-200" />
                      Reporte de Expedientes
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/reporte-indicios"
                      onClick={toggleMenu}
                      className="flex items-center gap-2 py-2 hover:bg-blue-600 rounded"
                    >
                      <ClipboardDocumentListIcon className="w-5 h-5 text-emerald-200" />
                      Reporte de Indicios
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/reporte-aprobaciones"
                      onClick={toggleMenu}
                      className="flex items-center gap-2 py-2 hover:bg-blue-600 rounded"
                    >
                      <ChartPieIcon className="w-5 h-5 text-purple-200" />
                      Reporte de Aprobaciones y Rechazos
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          )}

          {/* Solo cerrar sesión en móvil */}
          {isAuthenticated && (
            <li>
              <button
                onClick={() => {
                  toggleMenu();
                  handleLogout();
                }}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded flex items-center justify-center gap-2"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                Cerrar sesión
              </button>
            </li>
          )}

          {/* NOTA: se eliminó el botón de “Iniciar sesión” en móvil y escritorio */}
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
