import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Estudiante {
  id: string;
  nombre: string;
  asistencia: number; 
  ultimaAsistencia: string | null; 
}

const EstudianteCard: React.FC<{ estudiante: Estudiante }> = ({ estudiante }) => {
  const parseFecha = (fechaStr: string | null) => {
    if (!fechaStr) return null;

    const [fecha, hora] = fechaStr.split(' ');
    const [day, month, year] = fecha.split('/'); 

    return new Date(`${year}-${month}-${day}T${hora}`);
  };

  const ultimaAsistencia = parseFecha(estudiante.ultimaAsistencia);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="w-12 h-12">
          <AvatarImage
            src={`https://ui-avatars.com/api/?name=${estudiante.nombre || 'Anonymous'}&background=random`}
            alt="Avatar"
          />
          <AvatarFallback>{estudiante.nombre ? estudiante.nombre[0] : 'N'}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>
            {estudiante.nombre}
            <span className="text-sm text-gray-500"> - ID: {estudiante.id}</span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-2">
          <strong>Última Asistencia:</strong>{' '}
          {ultimaAsistencia ? ultimaAsistencia.toLocaleDateString() : "Sin registro"}
        </p>
        <Badge className={estudiante.asistencia >= 80 ? "bg-green-500" : "bg-red-500"}>
          Asistencia: {estudiante.asistencia}%
        </Badge>
      </CardContent>
    </Card>
  );
};

const EstudiantesPage: React.FC = () => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstudiantes = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/api/estudiantes');
        const data = await response.json();

        if (response.ok) {
          const estudiantesAdaptados = data.estudiantes.map((est: any) => ({
            id: est.id || 'N/A',
            nombre: est.nombre,
            asistencia: est.porcentaje_asistencia,
            ultimaAsistencia: est.ultimo_registro || null,
          }));
          setEstudiantes(estudiantesAdaptados);
        } else {
          setError(data.error || 'Error al obtener estudiantes');
        }
      } catch (err) {
        setError('Error de red al intentar cargar estudiantes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEstudiantes();
  }, []);

  if (isLoading) {
    return <p className="text-center text-gray-500">Cargando estudiantes...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Error: {error}</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-[#291471]">Estudiantes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {estudiantes.map((estudiante) => (
          <EstudianteCard key={estudiante.id} estudiante={estudiante} />
        ))}
      </div>
    </div>
  );
};

export default EstudiantesPage;
