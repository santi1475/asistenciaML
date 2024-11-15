import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  return (
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
  );
}
