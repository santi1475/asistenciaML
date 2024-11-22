import { useState } from 'react';
import { 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface EstudianteFormProps {
  nombre: string;
  apellido: string;
  setNombre: React.Dispatch<React.SetStateAction<string>>;
  setApellido: React.Dispatch<React.SetStateAction<string>>;
  handleAddStudent: () => Promise<void>;
}

export default function EstudianteForm({
  nombre,
  apellido,
  setNombre,
  setApellido,
  handleAddStudent,
}: EstudianteFormProps) {
  const [isSaving, setIsSaving] = useState(false); // Controla el estado del botón Guardar.

  const onSave = async () => {
    try {
      setIsSaving(true); // Deshabilita el botón mientras procesa.
      await handleAddStudent();
      alert('Estudiante agregado correctamente.');
    } catch (error) {
      console.error('Error al agregar estudiante:', error);
      alert('Ocurrió un error al agregar el estudiante. Inténtelo nuevamente.');
    } finally {
      setIsSaving(false); // Rehabilita el botón después de la operación.
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Agregar Nuevo Estudiante</DialogTitle>
        <DialogDescription>
          Ingrese los datos del nuevo estudiante y haga clic en "Guardar" para agregarlo.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        {/* Campo Nombre */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="nombre" className="text-right">
            Nombre
          </Label>
          <Input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="col-span-3"
            placeholder="Ingrese el nombre"
            aria-label="Nombre del estudiante"
          />
        </div>

        {/* Campo Apellido */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="apellido" className="text-right">
            Apellido
          </Label>
          <Input
            id="apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            className="col-span-3"
            placeholder="Ingrese el apellido"
            aria-label="Apellido del estudiante"
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          onClick={onSave}
          disabled={isSaving} // Evita múltiples envíos mientras guarda.
          className={`bg-[#291471] text-white transition-colors ${
            isSaving
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-[#f8c200] hover:text-[#291471]'
          }`}
          aria-label="Guardar estudiante"
        >
          {isSaving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
