// src/components/VersionTransitionOverlay.tsx
import React from "react";
import { Sparkles } from "lucide-react";

interface VersionTransitionOverlayProps {
  targetVersion?: "lite" | "pro";
}

const VersionTransitionOverlay: React.FC<VersionTransitionOverlayProps> = ({
  targetVersion = "pro",
}) => {
  const isPro = targetVersion === "pro";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-900 via-vet-secondary to-slate-900">
      {/* Contenido central */}
      <div className="flex flex-col items-center gap-8">
        {/* Loader de círculos */}
        <div className="relative w-24 h-24">
          {/* Círculo exterior */}
          <div className="absolute inset-0 rounded-full border-4 border-white/10" />
          
          {/* Círculo giratorio 1 */}
          <div 
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-vet-accent animate-spin"
            style={{ animationDuration: "1s" }}
          />
          
          {/* Círculo giratorio 2 */}
          <div 
            className="absolute inset-2 rounded-full border-4 border-transparent border-t-white/60 animate-spin"
            style={{ animationDuration: "0.8s", animationDirection: "reverse" }}
          />
          
          {/* Círculo giratorio 3 */}
          <div 
            className="absolute inset-4 rounded-full border-4 border-transparent border-t-vet-primary animate-spin"
            style={{ animationDuration: "1.2s" }}
          />

          {/* Centro con icono */}
          <div className="absolute inset-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            {isPro ? (
              <Sparkles className="w-6 h-6 text-vet-accent animate-pulse" />
            ) : (
              <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
            )}
          </div>
        </div>

        {/* Texto */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-white font-montserrat">
            {isPro ? "Activando Pro" : "Cambiando a Lite"}
          </h3>
          <p className="text-white/50 text-sm">
            Un momento por favor...
          </p>
        </div>

        {/* Puntos animados */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-vet-accent animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VersionTransitionOverlay;