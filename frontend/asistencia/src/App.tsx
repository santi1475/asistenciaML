import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, Users, BookOpen, Brain, Cog, Eye, UserPlus } from 'lucide-react'
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

export default function ProfesorDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)

  // Función para iniciar la cámara
  const enableCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      setVideoStream(stream)
      setCameraEnabled(true)
    } catch (error) {
      console.error("Error al acceder a la cámara:", error)
    }
  }

  // Función para detener la cámara
  const disableCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop())
    }
    setCameraEnabled(false)
  }

  // Función para captura de rostros
  const handleCapture = async () => {
    try {
      await fetch('http://localhost:5000/api/captura_rostro', { method: 'POST' })
      alert("Captura de rostros completada")
    } catch (error) {
      console.error("Error en captura de rostro:", error)
    }
  }

  // Función para entrenar el modelo
  const handleTrain = async () => {
    try {
      await fetch('http://localhost:5000/api/entrenar', { method: 'POST' })
      alert("Entrenamiento completado")
    } catch (error) {
      console.error("Error en entrenamiento:", error)
    }
  }

  // Función para reconocimiento de rostro
  const handleRecognition = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reconocer', { method: 'POST' })
      const result = await response.json()
      alert(`Resultado del reconocimiento: ${result.resultado}`)
    } catch (error) {
      console.error("Error en reconocimiento de rostro:", error)
    }
  }

  //Funcion para agregar estudiantes
  async function handleAddStudent(nombre: string): Promise<void> {
    try {
        const response = await fetch('http://localhost:5000/api/agregar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre_estudiante: nombre })
        });
        
        const data = await response.json();
        if (response.ok) {
            alert("Captura de rostros completada");
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
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
            <li>
              <a href="#" className="flex items-center space-x-2 hover:text-[#f8c200] transition-colors">
                <BookOpen className="h-5 w-5" />
                <span>Cursos</span>
              </a>
            </li>
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
          
            {/* Contenedor de Estudiantes */}
            {currentPage === 'dashboard' && (
          <Dialog>
            <DialogTrigger asChild>
              <Button onClick={() => handleAddStudent('Nombre del Estudiante')} className="p-5 m-4 bg-[#291471] 
              text-xl hover:bg-[#2c9d44] hover:text-[#ffffff] transition-colors">
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
                  <Label htmlFor="nombre" className="text-right">
                    Nombre
                  </Label>
                  <Input id="nombre" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="apellido" className="text-right">
                    Apellido
                  </Label>
                  <Input id="apellido" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-[#291471] hover:bg-[#f8c200] hover:text-[#291471] transition-colors">Guardar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
            {/* Contenedor de IA */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Inteligencia Artificial</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Button onClick={handleTrain} className="bg-[#291471] hover:bg-[#f8c200] hover:text-[#291471] transition-colors">
                  <Brain className="mr-2 h-4 w-4" /> Entrenamiento
                </Button>
                <Button onClick={handleCapture} className="bg-[#291471] hover:bg-[#f8c200] hover:text-[#291471] transition-colors">
                  <Cog className="mr-2 h-4 w-4" /> Procesamiento
                </Button>
                <Button onClick={handleRecognition} className="bg-[#291471] hover:bg-[#f8c200] hover:text-[#291471] transition-colors">
                  <Eye className="mr-2 h-4 w-4" /> Reconocimiento
                </Button>
                <Button onClick={cameraEnabled ? disableCamera : enableCamera} className="bg-[#291471] hover:bg-[#f8c200] hover:text-[#291471] transition-colors">
                  {cameraEnabled ? 'Desactivar' : 'Activar'} Cámara
                </Button>
              </CardContent>
              {cameraEnabled && (
                <div className="mt-4">
                  <video
                    autoPlay
                    ref={video => {
                      if (video && videoStream) {
                        video.srcObject = videoStream
                      }
                    }}
                    className="w-full h-auto"
                  />
                </div>
              )}
            </Card>
          </>
        ) : (
          <EstudiantesPage />
        )}
      </main>
    </div>
  )
}
