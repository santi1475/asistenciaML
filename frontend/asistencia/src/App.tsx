import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, Users, Brain, Eye, UserPlus } from 'lucide-react'
import EstudiantesPage from './estudiantes-page.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Define el tipo de estudiante
interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  curso: string;
  asistencia: number;
  ultimaAsistencia: Date | null;
}

export default function ProfesorDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')

  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);

  // Función para cargar estudiantes desde las carpetas
  const cargarEstudiantesDesdeCarpetas = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/cargar_estudiantes', {
        method: 'GET'
      });
      const data = await response.json();
      if (response.ok) {
        setEstudiantes(data.estudiantes.map((est: Estudiante) => ({
          ...est,
          ultimaAsistencia: est.ultimaAsistencia ? new Date(est.ultimaAsistencia) : null
        })));
      } else {
        console.error("Error al cargar estudiantes:", data.error);
      }
    } catch (error) {
      console.error("Error al cargar estudiantes:", error);
    }
  };

  // Cargar estudiantes cuando se monta el componente
  useEffect(() => {
    console.log("Estado de estudiantes actualizado:", estudiantes);
  }, [estudiantes]);
  

  // Función para entrenar el modelo
  const handleTrain = async () => {
    try {
      await fetch('http://localhost:5000/api/entrenar', { method: 'POST' })
      alert("Entrenamiento completado")
    } catch (error) {
      console.error("Error en entrenamiento:", error)
    }
  }
  const handleRecognition = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reconocer', { method: 'POST' });
      const result = await response.json();
  
      if (response.ok) {
        alert(`Estudiante reconocido: ${result.resultado}`);
        
        console.log("ID estudiante reconocido:", result.id_estudiante);
        
        if (result.id_estudiante !== null) {
          // Actualiza asistencia y última fecha de asistencia
          actualizarAsistencia(result.id_estudiante);
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
  
  // En la función actualizarAsistencia del frontend
  const actualizarAsistencia = (id_estudiante: string) => {
    setEstudiantes(prevEstudiantes =>
      prevEstudiantes.map(est =>
        est.id === id_estudiante ? { ...est, asistencia: 100, ultimaAsistencia: date || null } : est
      )
    );
  };


  async function handleAddStudent() {
    try {
      const response = await fetch('http://localhost:5000/api/agregar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_estudiante: nombre, apellido_estudiante: apellido })
      });
  
      // Intenta parsear la respuesta como JSON
      const data = await response.json();
  
      if (response.ok) {
        // Muestra un mensaje de éxito al usuario
        alert("Captura de rostros completada");
  
        // Opcional: Limpia los campos de nombre y apellido si es necesario
        setNombre(''); 
        setApellido('');
  
        // Opcional: Actualiza el estado de estudiantes o recarga la lista de estudiantes
        cargarEstudiantesDesdeCarpetas(); // Asegúrate de tener esta función definida en tu componente para recargar la lista
      } else {
        // Muestra un mensaje de error si la respuesta no es exitosa
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      // Maneja cualquier error de red o problemas de conexión
      console.error("Error al iniciar captura de rostros:", error);
      alert("Ocurrió un error al intentar capturar el rostro.");
    }
  }
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Barra lateral */}
      <aside className="w-64 bg-[#291471] text-white p-6">
        <h1 className="text-2xl font-bold mb-10">Sistema de Asistencias</h1>
        <nav>
          <ul className="space-y-4">
            <li>
              <a 
                href="#" 
                className="flex items-center space-x-2 hover:text-[#f8c200] transition-colors"
                onClick={() => setCurrentPage('dashboard')}>
                <BarChart className="h-5 w-5" />
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center space-x-2 hover:text-[#f8c200] transition-colors"
                onClick={() => setCurrentPage('estudiantes')}
              >
                <Users className="h-5 w-5" />
                <span>Estudiantes</span>
              </a>
            </li>
            {/* Puedes agregar más opciones de menú aquí */}
          </ul>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-8 overflow-auto">
        {currentPage === 'dashboard' ? (
          <>
            <h2 className="text-3xl font-semibold mb-6">Bienvenido, Profesor</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Resumen */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Asistencias</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">85%</p>
                  <p className="text-gray-600">Asistencia promedio esta semana</p>
                </CardContent>
              </Card>

              {/* Calendario */}
              <Card>
                <CardHeader>
                  <CardTitle>Calendario</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>
            </div>
          
            {/* Botones de IA y Agregar Estudiante */}
            <div className="mb-6 flex flex-wrap gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-[#291471] text-xl hover:bg-[#f8c200] hover:text-[#291471] transition-colors">
                    <UserPlus className="mr-2 h-4 w-4" />Agregar Estudiante
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Agregar Nuevo Estudiante</DialogTitle>
                    <DialogDescription>
                      Ingrese los datos del nuevo estudiante aquí. Haga clic en guardar cuando termine.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="nombre" className="text-right">Nombre</Label>
                      <Input 
                        id="nombre" 
                        className="col-span-3" 
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="apellido" className="text-right">Apellido</Label>
                      <Input 
                        id="apellido" 
                        className="col-span-3" 
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" onClick={handleAddStudent} className="bg-[#291471] hover:bg-[#f8c200] hover:text-[#291471] transition-colors">
                      Guardar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button onClick={handleTrain} className="bg-[#291471] hover:bg-[#f8c200] hover:text-[#291471] transition-colors">
                <Brain className="mr-2 h-4 w-4" /> Entrenamiento
              </Button>
              <Button onClick={handleRecognition} className="bg-[#291471] hover:bg-[#f8c200] hover:text-[#291471] transition-colors">
                <Eye className="mr-2 h-4 w-4" /> Reconocimiento
              </Button>
            </div>
          </>
        ) : (
          <EstudiantesPage estudiantes={estudiantes} />
        )}
      </main>
    </div>
  )
}
