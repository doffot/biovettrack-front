import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-14 h-7 
        bg-card border border-border rounded-full
        transition-all duration-300 hover:border-vet-primary/50
        shadow-soft hover:shadow-card group"
      aria-label={`Cambiar a modo ${theme === "light" ? "oscuro" : "claro"}`}
    >
      {/* Slider animado */}
      <div
        className={`absolute w-5 h-5 rounded-full 
          bg-gradient-to-br shadow-md
          transition-all duration-300 ease-in-out
          ${
            theme === "light"
              ? "left-1 from-amber-400 to-orange-500"
              : "left-8 from-indigo-500 to-purple-600"
          }`}
      >
        {/* Icono dentro del slider */}
        <div className="absolute inset-0 flex items-center justify-center">
          {theme === "light" ? (
            <Sun className="w-3 h-3 text-white animate-gentle-pulse" />
          ) : (
            <Moon className="w-3 h-3 text-white animate-gentle-pulse" />
          )}
        </div>
      </div>

      {/* Iconos de fondo (decorativos) */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5">
        <Sun
          className={`w-3.5 h-3.5 transition-all duration-300 ${
            theme === "light"
              ? "text-transparent"
              : "text-vet-muted opacity-50"
          }`}
        />
        <Moon
          className={`w-3.5 h-3.5 transition-all duration-300 ${
            theme === "dark"
              ? "text-transparent"
              : "text-vet-muted opacity-50"
          }`}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;