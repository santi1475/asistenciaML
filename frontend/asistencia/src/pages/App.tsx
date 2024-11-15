import { useState, useEffect } from 'react';
import Sidebar from '../components/parts/Sidebar.tsx';
import EstudiantesPage from '../components/parts/estudiantes-page.tsx';
import Dashboard from '../components/parts/Dashboard.tsx';
import LoadingScreen from '../components/ui/loading.tsx';
import AsistenciaDashboard from '../components/parts/PaginaAsistencia.tsx';

interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  curso: string;
  asistencia: number;
  ultimaAsistencia: Date | null;
  estado: string; // Agregar estado
  horaEntrada: string | null; // Agregar horaEntrada
}


export default function App() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cargarEstudiantesDesdeCarpetas = async () => {
    setIsLoading(true); // Mostrar pantalla de carga
    try {
      const response = await fetch('http://localhost:5000/api/cargar_estudiantes', { method: 'GET' });
      const data = await response.json();
      if (response.ok) {
        setEstudiantes(
          data.estudiantes.map((est: any) => ({
            id: est.id,
            nombre: est.nombre,
            apellido: est.apellido,
            curso: est.curso || 'Sin asignar',
            asistencia: est.asistencia || 0,
            ultimaAsistencia: est.ultimaAsistencia ? new Date(est.ultimaAsistencia) : null,
            estado: est.estado || 'No asistió',  // Asignar valor predeterminado
            horaEntrada: est.horaEntrada || null, // Asignar valor predeterminado
          }))
        );
      } else {
        console.error('Error al cargar estudiantes:', data.error);
        alert(`Error al cargar estudiantes: ${data.error}`);
      }
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
      alert('Error al cargar la lista de estudiantes.');
    } finally {
      setIsLoading(false); // Ocultar pantalla de carga
    }
  };  

  useEffect(() => {
    cargarEstudiantesDesdeCarpetas();
  }, []);

  const handleTrain = async () => {
    setIsLoading(true); // Mostrar pantalla de carga
    try {
      await fetch('http://localhost:5000/api/entrenar', { method: 'POST' });
      alert('Entrenamiento completado.');
    } catch (error) {
      console.error('Error en entrenamiento:', error);
      alert('Ocurrió un error durante el entrenamiento.');
    } finally {
      setIsLoading(false); // Ocultar pantalla de carga
    }
  };

  const handleRecognition = async () => {
    setIsLoading(true); // Mostrar pantalla de carga
    try {
      const response = await fetch('http://localhost:5000/api/reconocer', { method: 'POST' });
      const result = await response.json();
      if (response.ok) {
        alert(`Estudiante reconocido: ${result.resultado}`);
        if (result.id_estudiante !== null) {
          actualizarAsistencia(result.id_estudiante);
        }
      } else {
        alert(`Error en reconocimiento: ${result.error}`);
      }
    } catch (error) {
      console.error('Error en reconocimiento de rostro:', error);
      alert('Ocurrió un error en el proceso de reconocimiento.');
    } finally {
      setIsLoading(false); // Ocultar pantalla de carga
    }
  };

  const actualizarAsistencia = (id_estudiante: string) => {
    setEstudiantes((prevEstudiantes) =>
      prevEstudiantes.map((est) =>
        est.id === id_estudiante
          ? { ...est, asistencia: 100, ultimaAsistencia: date || null }
          : est
      )
    );
  };

  const handleAddStudent = async () => {
    if (!nombre || !apellido) {
      alert('Por favor, ingrese un nombre y apellido válidos.');
      return;
    }
    setIsLoading(true); // Mostrar pantalla de carga
    try {
      const response = await fetch('http://localhost:5000/api/agregar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_estudiante: nombre, apellido_estudiante: apellido }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Estudiante guardado.');
        setNombre('');
        setApellido('');
        cargarEstudiantesDesdeCarpetas();
      } else {
        alert(`Error al guardar estudiante: ${data.error}`);
      }
    } catch (error) {
      console.error('Error al agregar estudiante:', error);
      alert('Ocurrió un error al intentar agregar el estudiante.');
    } finally {
      setIsLoading(false); // Ocultar pantalla de carga
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar setCurrentPage={setCurrentPage} />
      <main className="flex-1 p-8 overflow-auto">
        {isLoading && <LoadingScreen />} {/* Mostrar pantalla de carga */}
        {!isLoading && currentPage === 'dashboard' && (
          <Dashboard
            date={date}
            setDate={setDate}
            nombre={nombre}
            apellido={apellido}
            setNombre={setNombre}
            setApellido={setApellido}
            handleAddStudent={handleAddStudent}
            handleTrain={handleTrain}
            handleRecognition={handleRecognition}
          />
        )}
        {!isLoading && currentPage === 'estudiantes' && <EstudiantesPage estudiantes={estudiantes} />}
        {!isLoading && currentPage === 'asistencia' && (
          <AsistenciaDashboard
            estudiantes={estudiantes}
            actualizarAsistencia={actualizarAsistencia}
            handleRecognition={handleRecognition}
          />
        )}
      </main>
    </div>
  );
}
