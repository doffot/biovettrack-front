import React, { useState, useEffect } from "react";

const messages = [
  "Cargando configuración inicial...",
  "Conectando con el servidor...",
  "Cargando datos del servidor...",
  "Preparando tu entorno...",
  "Casi listo...",
];

const InitialLoadingScreen: React.FC = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-vet-primary to-vet-secondary flex flex-col items-center justify-center p-4">
      <div className="w-12 h-12 border-4 border-vet-light border-t-vet-secondary rounded-full animate-spin mb-6"></div>
      <p className="text-white/90 text-center text-sm font-medium">
        {messages[currentMessageIndex]}
      </p>
    </div>
  );
};

export default InitialLoadingScreen;