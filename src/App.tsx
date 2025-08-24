import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <Router>
      <Navbar />
      <main className="bg-gray-100 min-h-screen px-4 py-6">
        <AppRoutes />
      </main>
    </Router>
  );
}

export default App;
