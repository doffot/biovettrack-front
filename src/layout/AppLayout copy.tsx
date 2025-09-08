// layout/AppLayout.tsx
import { Outlet, Link } from 'react-router-dom';
import AppMenu from '../components/AppMenu';
import { useLocation } from 'react-router-dom';
import Logo from '../components/Logo';

export default function AppLayout() {
  const location = useLocation();
  const isRoot = location.pathname === '/';

  return (
    <>
      {/* Header global - FIJO */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 pointer-events-none">
        <div className="pointer-events-auto">
          <button className="inline-flex items-center gap-2 bg-background/60 backdrop-blur-sm border border-primary/30 rounded-lg px-3 py-1.5 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 group">
            <div className="w-2 h-2 bg-primary rounded-full animate-neon-pulse"></div>
            <span className="text-primary text-xs font-medium group-hover:text-text">Dr. García</span>
            <div className="text-primary/60 group-hover:text-primary transition-colors duration-300">⚙️</div>
          </button>
        </div>

        <div className="pointer-events-auto">
          <button className="inline-flex items-center gap-2 bg-background/60 backdrop-blur-sm border border-danger/30 rounded-lg px-3 py-1.5 hover:border-danger/50 hover:bg-danger/10 transition-all duration-300 group">
            <span className="text-danger text-xs font-medium group-hover:text-text">Salir</span>
            <div className="text-danger group-hover:text-text">🚪</div>
          </button>
        </div>
      </header>

      {/* Logo global - FIJO */}
      <div className="fixed top-16 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <Link to="/">
            <Logo 
              size="md"
              showText={true}
              showSubtitle={true}
              className="justify-center"
            />
          </Link>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col min-h-screen pt-32 pb-16">
        {isRoot ? <AppMenu /> : <Outlet />}
      </main>

      {/* Footer global - FIJO */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 flex-shrink-0 text-center py-4">
        <div className="flex items-center justify-center mb-2">
          <div className="w-4 md:w-6 lg:w-8 h-px bg-primary/40"></div>
          <div className="mx-2 md:mx-3 w-1.5 md:w-2 h-1.5 md:h-2 bg-primary rounded-full animate-neon-pulse"></div>
          <div className="w-4 md:w-6 lg:w-8 h-px bg-primary/40"></div>
        </div>
        <p className="text-muted/60 text-[10px] md:text-xs font-mono tracking-wider">
          {">"} POWERED_BY_DOFFOTDEV {"<"}
        </p>
      </footer>
    </>
  );
}