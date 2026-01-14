import { Navigate } from 'react-router-dom';
import LandingView from '../view/public/LandingView';
import { useAuth } from '../hooks/useAuth';

const ProtectedLanding = () => {
  // 1. Verificación rápida: Si no hay token en LocalStorage, es público.
  // Esto evita que 'useAuth' haga la petición y el interceptor te redirija.
  const token = localStorage.getItem('AUTH_TOKEN_LABVET');
  
  if (!token) {
    return <LandingView />;
  }

  // 2. Si hay token, usamos useAuth para verificar que sea válido
  const { data: user, isLoading } = useAuth();

  // Mientras valida el token existente...
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-vet-primary"></div>
      </div>
    );
  }

  // 3. Si hay usuario válido, vamos al Dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Si hubo error (token vencido/inválido) o no hay usuario, mostramos la Landing
  // (El interceptor podría haber actuado ya, pero por si acaso retornamos la vista)
  return <LandingView />;
};

export default ProtectedLanding;