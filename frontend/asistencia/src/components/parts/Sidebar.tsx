import { BarChart, Users } from 'lucide-react';

interface SidebarProps {
  setCurrentPage: (page: string) => void;
}

export default function Sidebar({ setCurrentPage }: SidebarProps) {
  return (
    <aside className="w-64 bg-[#291471] text-white p-6 content-center">
      <h1 className="text-2xl font-bold mb-10">Sistema de Asistencias</h1>
      <nav>
        <ul className="space-y-4">
          <li>
            <a 
              href="#" 
              className="flex items-center space-x-2 hover:text-[#f8c200] transition-colors"
              onClick={() => setCurrentPage('dashboard')}
            >
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
            <a
              href="#"
              className="flex items-center space-x-2 hover:text-[#f8c200] transition-colors"
              onClick={() => setCurrentPage('asistencia')} 
            >
              <Users className="h-5 w-5" />
              <span>Tomar Asitencia</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
