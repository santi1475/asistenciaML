import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  curso: string;
  asistencia: number;
  ultimaAsistencia: Date | null;
}

interface EstudiantesPageProps {
  estudiantes: Estudiante[];
}

const EstudianteCard: React.FC<{ estudiante: Estudiante }> = ({ estudiante }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center gap-4">
      <Avatar className="w-12 h-12">
        <AvatarImage src={`https://i.pravatar.cc/48?u=${estudiante.id}`} alt={estudiante.nombre} />
        <AvatarFallback>{estudiante.nombre[0]}{estudiante.apellido[0]}</AvatarFallback>
      </Avatar>
      <div>
        <CardTitle>
          {`${estudiante.nombre} ${estudiante.apellido}`}
          <span className="text-sm text-gray-500"> - ID: {estudiante.id}</span>
        </CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <p className="mb-2"><strong>Curso:</strong> {estudiante.curso}</p>
      <p className="mb-2"><strong>Última Asistencia:</strong> {estudiante.ultimaAsistencia ? estudiante.ultimaAsistencia.toLocaleDateString() : "Sin registro"}</p>
      <Badge className={estudiante.asistencia >= 80 ? "bg-green-500" : "bg-red-500"}>
        Asistencia: {estudiante.asistencia}%
      </Badge>
    </CardContent>
  </Card>
)

const EstudiantesPage: React.FC<EstudiantesPageProps> = ({ estudiantes }) => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-[#291471]">Estudiantes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {estudiantes.map((estudiante) => (
          <EstudianteCard  estudiante={estudiante} />
        ))}
      </div>
    </div>
  )
}

export default EstudiantesPage
