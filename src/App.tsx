import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* Navbar */}
        <Navbar />

        {/* Contenido principal */}
        <main className="flex-grow bg-gray-100 px-4 py-6">
          <AppRoutes />
        </main>

        {/* Footer */}
        <footer className="bg-blue-500 text-white py-4 text-center">
          <p className="text-sm">© {new Date().getFullYear()} Desarrollado por Mvásquez  | SIGES</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
