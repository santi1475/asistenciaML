import { BarChart, Users, CircleUserRound } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SidebarProps {
  setCurrentPage: (page: string) => void;
}

export default function Sidebar({ setCurrentPage }: SidebarProps) {
  const [gradientPosition, setGradientPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setGradientPosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const gradientStyle = {
    backgroundImage: `radial-gradient(circle at ${gradientPosition.x * 100}% ${gradientPosition.y * 100}%, #3c1a9d 0%, #291471 50%, #1c0d4d 100%)`,
  };

  return (
    <aside 
      className="w-64 text-white p-6 content-center relative overflow-hidden transition-all duration-300 ease-in-out"
      style={gradientStyle}
    >
      <div className="relative z-10">
        <h1 className="text-2xl font-bold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-white to-[#f8c200]">
          Sistema de Asistencias
        </h1>
        <nav>
          <ul className="space-y-4">
            {[
              { icon: BarChart, label: 'Dashboard', page: 'dashboard' },
              { icon: CircleUserRound, label: 'Estudiantes', page: 'estudiantes' },
              { icon: Users, label: 'Tomar Asistencia', page: 'asistencia' },
            ].map(({ icon: Icon, label, page }) => (
              <li key={page}>
                <a 
                  href="#" 
                  className="flex items-center space-x-2 hover:text-[#f8c200] transition-colors group"
                  onClick={() => setCurrentPage(page)}
                >
                  <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <span className="relative overflow-hidden">
                    <span className="inline-block transition-transform duration-300 ease-in-out group-hover:-translate-y-full">{label}</span>
                    <span className="absolute top-0 left-0 inline-block transition-transform duration-300 ease-in-out translate-y-full group-hover:translate-y-0">{label}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1c0d4d] opacity-50"></div>
    </aside>
  );
}

