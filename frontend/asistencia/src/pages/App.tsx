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
  estado: EstadoAsistencia; // Estado del estudiante
  horaEntrada: string | null; // Hora de entrada
}

type EstadoAsistencia = 'Presente' | 'Tardanza' | 'No asistió';

export default function App() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Función para cargar estudiantes
  const cargarEstudiantesDesdeCarpetas = async () => {
    setIsLoading(true);
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
            estado: est.estado || 'No asistió',
            horaEntrada: est.horaEntrada || null,
          }))
        );
      } else {
        alert(`Error al cargar estudiantes: ${data.error}`);
      }
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
      alert('Error al cargar la lista de estudiantes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarEstudiantesDesdeCarpetas();
  }, []);

  // Dentro de App.tsx, después de otras funciones:
  const entrenarIA = async () => {
    setIsLoading(true); // Mostrar pantalla de carga
    try {
      const response = await fetch('http://localhost:5000/api/entrenar', { method: 'POST' });
      if (response.ok) {
        alert('Entrenamiento completado con éxito.');
      } else {
        const data = await response.json();
        alert(`Error durante el entrenamiento: ${data.error}`);
      }
    } catch (error) {
      console.error('Error durante el entrenamiento:', error);
      alert('Ocurrió un error al intentar entrenar la IA.');
    } finally {
      setIsLoading(false); // Ocultar pantalla de carga
    }
  };

  
  // Función para actualizar asistencia
  const actualizarAsistencia = (id_estudiante: string, nuevoEstado: EstadoAsistencia, horaEntrada: string | null) => {
    setEstudiantes((prevEstudiantes) =>
      prevEstudiantes.map((estudiante) =>
        estudiante.id === id_estudiante
          ? { ...estudiante, estado: nuevoEstado, horaEntrada }
          : estudiante
      )
    );
  };

  // Función para reconocer a un estudiante
  const reconocerEstudiante = async (): Promise<{ id: string; estado: EstadoAsistencia; horaEntrada: string | null } | null> => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/reconocer_estudiante', { method: 'POST' });
      const result = await response.json();
      if (response.ok) {
        const { id, estado, hora } = result.asistencia; // Ajusta según la estructura actual de la respuesta.
        return { id, estado, horaEntrada: hora };
      } else {
        alert(`Error: ${result.mensaje}`);
        return null;
      }
    } catch (error) {
      console.error('Error en reconocimiento:', error);
      alert('Ocurrió un error durante el reconocimiento.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para agregar un estudiante
  const handleAddStudent = async () => {
    if (!nombre || !apellido) {
      alert('Por favor, ingrese un nombre y apellido válidos.');
      return;
    }
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };
  
  // Función para reconocer a un estudiante y actualizar su asistencia
  const handleRecognitionAndUpdate = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reconocer', { method: 'POST' });
      const result = await response.json();
  
      if (response.ok) {
        alert(`Estudiante reconocido: ${result.resultado}`);
        
        console.log("ID estudiante reconocido:", result.id_estudiante);
        
        if (result.id_estudiante !== null) {
          console.log("Actualizando asistencia...");
        } else {
          console.error("Error: ID del estudiante no encontrado en el resultado de reconocimiento.");
        }
      } else {
        alert(`Error en reconocimiento: ${result.error}`);
      }
    } catch (error) {
      console.error("Error en reconocimiento de rostro:", error);
      alert("Ocurrió un error en el proceso de reconocimiento.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar setCurrentPage={setCurrentPage} />
      <main className="flex-1 p-8 overflow-auto">
        {isLoading && <LoadingScreen />}
        {!isLoading && currentPage === 'dashboard' && (
          <Dashboard
            date={date}
            setDate={setDate}
            nombre={nombre}
            apellido={apellido}
            setNombre={setNombre}
            setApellido={setApellido}
            handleAddStudent={handleAddStudent}
            handleTrain={entrenarIA}
            handleRecognition={handleRecognitionAndUpdate}
          />
        )}
        {!isLoading && currentPage === 'estudiantes' && <EstudiantesPage />}
        {!isLoading && currentPage === 'asistencia' && (
          <AsistenciaDashboard
            estudiantes={estudiantes}
            actualizarAsistencia={actualizarAsistencia}
            handleRecognitionAsistencia={reconocerEstudiante}
          />
        )}
      </main>
    </div>
  );
}
