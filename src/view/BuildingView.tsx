import { useNavigate } from "react-router-dom";

export default function BuildingView() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-4 overflow-hidden relative">
      
      {/* Elementos decorativos de fondo (usando tus animaciones) */}
      <div className="absolute top-[-10%] left-[-5%] w-72 h-72 bg-[var(--color-vet-primary)] opacity-10 blur-[100px] animate-[var(--animate-morph)]"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-[var(--color-vet-accent)] opacity-10 blur-[100px] animate-[var(--animate-morph)]"></div>

      <div className="z-10 text-center flex flex-col items-center">
        
        {/* Logo con animación sutil */}
        <div className="mb-8 animate-[var(--animate-gentle-pulse)]">
          <img 
            src="/logo_menu.svg" 
            alt="Logo" 
            className="w-40 md:w-56 h-auto drop-shadow-[0_0_15px_rgba(54,188,212,0.3)]"
          />
        </div>

        {/* Icono de construcción o progreso */}
        <div className="mb-6 relative">
          <div className="w-20 h-20 border-4 border-[var(--color-border)] border-t-[var(--color-vet-accent)] rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-[var(--color-vet-accent)] animate-[var(--animate-pulse-slow)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
             </span>
          </div>
        </div>

        {/* Textos con tus fuentes */}
        <h1 className="font-[var(--font-montserrat)] text-3xl md:text-5xl  text-[var(--color-vet-text)] mb-4 animate-[var(--animate-fade-in-up)]">
          Módulo en Construcción
        </h1>
        
        <p className="font-[var(--font-inter)] text-[var(--color-vet-muted)] max-w-md mx-auto mb-10 text-lg leading-relaxed animate-[var(--animate-fade-in-up)]">
          Estamos preparando algo increíble para la gestión de tu veterinaria. 
          Esta funcionalidad estará disponible muy pronto.
        </p>

        {/* Botón de acción con tus sombras y colores */}
        <button
          onClick={() => navigate("/dashboard")}
          className="group relative font-[var(--font-roboto)]  text-[var(--color-vet-text)] 
                     bg-[var(--color-vet-primary)] hover:bg-[var(--color-vet-secondary)] 
                     px-8 py-3 rounded-xl transition-all duration-300 
                     shadow-[var(--shadow-card)] hover:scale-105 active:scale-95
                     flex items-center gap-2 overflow-hidden"
        >
          {/* Efecto de brillo (Shine) al pasar el mouse */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[var(--animate-shine)]"></div>
          
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          Volver al Panel Principal
        </button>

      </div>

      {/* Partículas flotantes decorativas */}
      <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-[var(--color-vet-accent)] rounded-full animate-[var(--animate-float-particle)] opacity-50"></div>
      <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-[var(--color-vet-primary)] rounded-full animate-[var(--animate-float-particle)] opacity-30 delay-1000"></div>
    </div>
  );
}