import React, { useState, useEffect } from "react";
import { Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Footer, HeaderDesktop, HeaderMobile, InitialLoadingScreen, SidebarDesktop } from "../components/layout";
import { useAuth } from "../hooks/useAuth";

const AppLayout: React.FC = () => {
  const [activeItem, setActiveItem] = useState("/");
  const { data, isError, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("AUTH_TOKEN_LABVET");
    queryClient.invalidateQueries({ queryKey: ["user"] });
    navigate("/auth/login");
  };

  if (isLoading) {
    return <InitialLoadingScreen />;
  }

  if (isError) {
    return <Navigate to="/auth/login" />;
  }

  if (!data) return null;

  return (
    // bg-vet-light aquí asegura que el fondo base respete el tema
    <div className="min-h-screen bg-vet-light text-vet-text overflow-hidden relative transition-colors duration-300">
      <HeaderDesktop />
      <HeaderMobile />
      <Footer logout={logout} />
      
      <SidebarDesktop activeItem={activeItem} setActiveItem={setActiveItem} />
      
      {/* 
         bg-vet-light aquí aplica el color #EEF2F6 (gris suave) en modo claro 
         y #0F172A (azul oscuro) en modo oscuro.
      */}
      <main className="pt-14 pb-20 lg:pt-16 lg:pb-0 lg:pl-64 relative min-h-screen bg-vet-light transition-colors duration-300">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;