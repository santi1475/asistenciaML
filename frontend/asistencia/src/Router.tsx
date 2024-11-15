import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/login';
import App from './pages/App';
import EstudiantesPage from './components/parts/estudiantes-page';

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<App />} />
        <Route path="/estudiantes" element={<EstudiantesPage estudiantes={[]} />} />
      </Routes>
    </Router>
  );
}
