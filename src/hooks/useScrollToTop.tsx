// src/hooks/useScrollToTop.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function useScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Desplaza suavemente al inicio del contenedor principal
    const mainContent = document.querySelector("main");
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Fallback: scroll global
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname]);
}