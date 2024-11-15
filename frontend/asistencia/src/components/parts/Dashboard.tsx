import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Eye, UserPlus } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import EstudianteForm from './FormAlum';

interface DashboardProps {
  date: Date | undefined;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  nombre: string;
  apellido: string;
  setNombre: React.Dispatch<React.SetStateAction<string>>;
  setApellido: React.Dispatch<React.SetStateAction<string>>;
  handleAddStudent: () => Promise<void>;
  handleTrain: () => Promise<void>;
  handleRecognition: () => Promise<void>;
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
  return (
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

      {/* Controles de IA y Agregar Estudiante */}
      <Card className="mb-6 flex flex-wrap gap-4 w-full max-w-[500px]">
        <CardHeader>
          <CardTitle>Controles de IA</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 overflow-hidden">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#291471] text-xl hover:bg-[#f8c200] hover:text-[#291471] transition-colors">
                <UserPlus className="mr-2 h-4 w-4" />Agregar Estudiante
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

          <Button onClick={handleTrain} className="bg-[#291471] hover:bg-[#f8c200] hover:text-[#291471] transition-colors">
            <Brain className="mr-2 h-4 w-4" /> Entrenamiento
          </Button>
          <Button onClick={handleRecognition} className="bg-[#291471] hover:bg-[#f8c200] hover:text-[#291471] transition-colors">
            <Eye className="mr-2 h-4 w-4" /> Reconocimiento
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
