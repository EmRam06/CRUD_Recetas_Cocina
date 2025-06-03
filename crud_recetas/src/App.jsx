import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { Navigate } from 'react-router';
import RecetasPage from './pages/RecetasPage';
import CrearRecetaPage from './pages/CrearRecetaPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/recetas" replace />} /> 
        <Route path="/recetas" element={<RecetasPage />} />
        <Route path="/recetas/nueva" element={<CrearRecetaPage />} />
        <Route path="*" element={<p>404 - Página no encontrada</p>} />
      </Routes>
    </Router>
  );
}

export default App;

