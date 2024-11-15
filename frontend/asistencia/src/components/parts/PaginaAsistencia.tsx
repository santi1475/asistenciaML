import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  curso: string;
  asistencia: number;
  ultimaAsistencia: Date | null;
  estado: string;
  horaEntrada: string | null;
}

type EstadoAsistencia = "Presente" | "Tardanza" | "No asistió";

interface AsistenciaDashboardProps {
  estudiantes: Estudiante[];
  actualizarAsistencia: (id_estudiante: string) => void;
  handleRecognition: () => void;
}

const AsistenciaDashboard: React.FC<AsistenciaDashboardProps> = ({
  estudiantes,
  handleRecognition,
}) => {
  const getBadgeColor = (estado: EstadoAsistencia) => {
    switch (estado) {
      case "Presente":
        return "bg-green-500";
      case "Tardanza":
        return "bg-yellow-500";
      case "No asistió":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#291471]">Toma de Asistencia</h2>
        <button
          onClick={handleRecognition}
          className="bg-[#291471] text-white hover:bg-[#f8c200] hover:text-[#291471] px-4 py-2 rounded"
        >
          Reconocer Asistencia
        </button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre del Estudiante</TableHead>
              <TableHead>Hora de Entrada</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {estudiantes.map((estudiante) => (
              <TableRow key={estudiante.id}>
                <TableCell>{estudiante.nombre}</TableCell>
                <TableCell>{estudiante.horaEntrada || "-"}</TableCell>
                <TableCell>
                  <Badge className={getBadgeColor(estudiante.estado as EstadoAsistencia)}>
                    {estudiante.estado}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AsistenciaDashboard;
