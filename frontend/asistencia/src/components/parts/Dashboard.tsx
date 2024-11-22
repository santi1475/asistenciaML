import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, Eye, UserPlus } from 'lucide-react'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import EstudianteForm from './FormAlum'
import { Dispatch, SetStateAction } from 'react'

type EstadoAsistencia = "Presente" | "Tardanza" | "No asistió"

interface DashboardProps {
  date: Date | undefined
  setDate: Dispatch<SetStateAction<Date | undefined>>
  nombre: string
  apellido: string
  setNombre: Dispatch<SetStateAction<string>>
  setApellido: Dispatch<SetStateAction<string>>
  handleAddStudent: () => Promise<void>
  handleTrain: () => void
  handleRecognition: () => Promise<{ id: string; estado: EstadoAsistencia; horaEntrada: string | null } | null>
}

export default function Dashboard({
  date,
  setDate,
  nombre,
  apellido,
  setNombre,
  setApellido,
  handleAddStudent,
  handleTrain,
  handleRecognition,
}: DashboardProps) {
  const handleRecognitionClick = async () => {
    try {
      const result = await handleRecognition()
      if (result) {
        alert(`Reconocido: ID ${result.id}, Estado: ${result.estado}, Hora: ${result.horaEntrada || 'N/A'}`)
      } else {
        alert('No se pudo reconocer a nadie.')
      }
    } catch (error) {
      console.error('Error en el reconocimiento:', error)
      alert('Ocurrió un error durante el reconocimiento.')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8 text-[#291471] hover:text-[#1D0F4D]">Bienvenido, Profesor</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Asistencias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-5xl font-bold text-[#291471]">85%</p>
              <p className="text-xl text-gray-600 mt-2">Asistencia promedio esta semana</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calendario de Asistencias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(day) => setDate(day || undefined)}
                className="rounded-md border"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Controles de IA</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#291471] text-white hover:bg-[#f8c200] hover:text-[#291471] transition-colors">
                <UserPlus className="mr-2 h-5 w-5" />Agregar Estudiante
              </Button>
            </DialogTrigger>
            <EstudianteForm
              nombre={nombre}
              apellido={apellido}
              setNombre={setNombre}
              setApellido={setApellido}
              handleAddStudent={handleAddStudent}
            />
          </Dialog>

          <Button
            onClick={handleTrain}
            className="bg-[#291471] text-white hover:bg-[#f8c200] hover:text-[#291471] transition-colors"
          >
            <Brain className="mr-2 h-5 w-5" /> Entrenamiento
          </Button>
          <Button
            onClick={handleRecognitionClick}
            className="bg-[#291471] text-white hover:bg-[#f8c200] hover:text-[#291471] transition-colors"
          >
            <Eye className="mr-2 h-5 w-5" /> Reconocimiento
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

