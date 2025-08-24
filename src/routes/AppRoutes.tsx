import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import RegistroExpediente from '../pages/RegistroExpedientes';
import RevisarExpedientes from '../pages/RevisarExpedientes';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';
import Login from '../pages/Login';
import useAuth from '../auth/useAuth';
import ExpedienteForm from '../components/ExpedienteForm';
import RegistroIndicio from '../pages/RegistroIndicio';
import IndicioForm from '../components/IndicioForm';
import ReporteExpedientes from '../pages/ReporteExpedientes';
import ReporteIndicios from '../pages/ReporteIndicios';
import ReporteAprobacionesRechazos from '../pages/ReporteAprobacionesRechazos';

const AppRoutes = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route
                path="/"
                element={
                    isAuthenticated ? <Home /> : <Navigate to="/login" />
                }
            />

            <Route path="/login" element={<Login />} />

            <Route
                path="/expediente"
                element={
                    <PrivateRoute>
                        <RoleRoute allowedRoles={[ 'tecnico' ]}>
                            <RegistroExpediente />
                        </RoleRoute>
                    </PrivateRoute>
                }
            />
            <Route
                path="/expediente-form"
                element={
                    <PrivateRoute>
                        <RoleRoute allowedRoles={[ 'tecnico' ]}>
                            <ExpedienteForm />
                        </RoleRoute>
                    </PrivateRoute>
                }
            />
            <Route
                path="/indicio"
                element={
                    <PrivateRoute>
                        <RoleRoute allowedRoles={[ 'tecnico' ]}>
                            <RegistroIndicio />
                        </RoleRoute>
                    </PrivateRoute>
                }
            />
            <Route
                path="/indicio-form"
                element={
                    <PrivateRoute>
                        <RoleRoute allowedRoles={[ 'tecnico' ]}>
                            <IndicioForm />
                        </RoleRoute>
                    </PrivateRoute>
                }
            />
            <Route
                path="/revisar"
                element={
                    <PrivateRoute>
                        <RoleRoute allowedRoles={[ 'coordinador' ]}>
                            <RevisarExpedientes />
                        </RoleRoute>
                    </PrivateRoute>
                }
            />
            <Route
                path="/reporte-indicios"
                element={
                    <PrivateRoute>
                        <RoleRoute allowedRoles={[ 'coordinador', 'tecnico' ]}>
                            <ReporteIndicios />
                        </RoleRoute>
                    </PrivateRoute>
                }
            />
            <Route
                path="/reporte-aprobaciones"
                element={
                    <PrivateRoute>
                        <RoleRoute allowedRoles={[ 'coordinador', 'tecnico' ]}>
                            <ReporteAprobacionesRechazos />
                        </RoleRoute>
                    </PrivateRoute>
                }
            />
            <Route
                path="/reporte-expedientes"
                element={
                    <PrivateRoute>
                        <RoleRoute allowedRoles={[ 'coordinador', 'tecnico' ]}>
                            <ReporteExpedientes />
                        </RoleRoute>
                    </PrivateRoute>
                }
            />
        </Routes>
    );
};

export default AppRoutes;
