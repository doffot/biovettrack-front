import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingView from '../view/public/LandingView';

// Ajusta este import según donde tengas tu hook/context de auth
import { useAuth } from '../hooks/useAuth'; // O como se llame tu hook de autenticación

const ProtectedLanding = () => {
  const navigate = useNavigate();
  const { data:isAuthenticated, isLoading } = useAuth(); // Ajusta según tu implementación

  useEffect(() => {
    // Si ya está autenticado, redirigir al dashboard
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Mientras carga, mostrar loading o nada
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-vet-primary"></div>
      </div>
    );
  }

  // Si no está autenticado, mostrar landing
  if (!isAuthenticated) {
    return <LandingView />;
  }

  // Si está autenticado, no mostrar nada (se redirigirá)
  return null;
};

export default ProtectedLanding;