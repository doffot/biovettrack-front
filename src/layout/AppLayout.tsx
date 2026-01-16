// src/components/layout/AppLayout.tsx
import React, { useState, useEffect } from "react";
import { Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { Footer, HeaderDesktop, HeaderMobile, InitialLoadingScreen, SidebarDesktop } from "../components/layout";

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
    <div className="min-h-screen bg-vet-light text-vet-text overflow-hidden relative">
      <HeaderDesktop />
      <HeaderMobile />
      <Footer logout={logout} />
      <SidebarDesktop activeItem={activeItem} setActiveItem={setActiveItem} />
      <main className="pt-14 pb-20 lg:pt-16 lg:pb-0 lg:pl-64 relative min-h-screen bg-vet-light">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;