import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Componente de tarjeta de estudiante
interface EstudianteCardProps {
  nombre: string;
  id: string;
  curso: string;
  asistencia: number;
}

const EstudianteCard: React.FC<EstudianteCardProps> = ({ nombre, id, curso, asistencia }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center gap-4">
      <Avatar className="w-12 h-12">
        <AvatarImage src={`https://i.pravatar.cc/48?u=${id}`} alt={nombre} />
        <AvatarFallback>{nombre.split(' ').map(n => n[0]).join('')}</AvatarFallback>
      </Avatar>
      <div>
        <CardTitle>{nombre}</CardTitle>
        <p className="text-sm text-gray-500">ID: {id}</p>
      </div>
    </CardHeader>
    <CardContent>
      <p className="mb-2"><strong>Curso:</strong> {curso}</p>
      <Badge variant={asistencia >= 80 ? "default" : "destructive"}>
        Asistencia: {asistencia}%
      </Badge>
    </CardContent>
  </Card>
)

// Datos de ejemplo de estudiantes
const estudiantes = [
  { id: "001", nombre: "Ana García", curso: "Matemáticas", asistencia: 95 },
  { id: "002", nombre: "Carlos López", curso: "Historia", asistencia: 88 },
  { id: "003", nombre: "María Rodríguez", curso: "Ciencias", asistencia: 75 },
  { id: "004", nombre: "Juan Martínez", curso: "Literatura", asistencia: 92 },
  { id: "005", nombre: "Laura Sánchez", curso: "Física", asistencia: 85 },
  { id: "006", nombre: "Pedro Ramírez", curso: "Química", asistencia: 78 },
]

export default function EstudiantesPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-[#291471]">Estudiantes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {estudiantes.map((estudiante) => (
          <EstudianteCard key={estudiante.id} {...estudiante} />
        ))}
      </div>
    </div>
  )
}