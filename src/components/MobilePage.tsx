// components/MobilePage.tsx
import { Link } from 'react-router-dom';
import Logo from './Logo';

interface MobilePageProps {
  title: string;
  children: React.ReactNode;
}

export default function MobilePage({ title, children }: MobilePageProps) {
  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Fondo cyberpunk (igual que MobileHome) */}
      <div className="absolute inset-0 opacity-5" 
           style={{
             backgroundImage: `
               linear-gradient(rgba(57, 255, 20, 0.1) 1px, transparent 1px),
               linear-gradient(90deg, rgba(57, 255, 20, 0.1) 1px, transparent 1px)
             `,
             backgroundSize: '50px 50px'
           }}>
      </div>

      {/* Electric mint radial glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl"></div>

      {/* Contenido */}
      <div className="relative z-10">
        {/* Barra superior */}
        <div className="flex items-center justify-between px-6 pt-14 pb-6">
          <Link to="/" className="text-primary hover:text-green-400 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-primary">{title}</h1>
          </div>

          <div className="w-6"></div> {/* Espacio simétrico */}
        </div>

        {/* Logo completo (con texto incluido) */}
        <div className="text-center mb-8 px-6">
          <Logo 
            size="xl" 
            showText={true} 
            showSubtitle={false} 
            className="mx-auto"
          />
        </div>

        {/* Contenido */}
        <div className="px-6 pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}