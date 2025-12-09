// src/contexts/VersionContext.tsx
import { createContext, useContext, useState, useEffect } from "react";

type Version = "lite" | "pro";

interface VersionContextType {
  version: Version;
  setVersion: (v: Version) => void;
  isChangingVersion: boolean;
}

const VersionContext = createContext<VersionContextType>({
  version: "lite",
  setVersion: () => {},
  isChangingVersion: false,
});

export const VersionProvider = ({ children }: { children: React.ReactNode }) => {
  const [version, setVersion] = useState<Version>("lite");
  const [isChangingVersion, setIsChangingVersion] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("vetsoft-version") as Version | null;
    if (saved) {
      setVersion(saved);
    }
  }, []);

  const updateVersion = (newVersion: Version) => {
    if (newVersion === version) return;

    setIsChangingVersion(true);

    setTimeout(() => {
      setVersion(newVersion);
      localStorage.setItem("vetsoft-version", newVersion);

      setTimeout(() => {
        setIsChangingVersion(false);
      }, 300);
    }, 400);
  };

  return (
    <VersionContext.Provider value={{ version, setVersion: updateVersion, isChangingVersion }}>
      {children}
      
      {/* Loader minimalista */}
      {isChangingVersion && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/95 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6">
            {/* Spinner de círculos */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-white/10" />
              <div 
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-vet-accent animate-spin"
                style={{ animationDuration: "0.8s" }}
              />
              <div 
                className="absolute inset-2 rounded-full border-4 border-transparent border-t-white/50 animate-spin"
                style={{ animationDuration: "0.6s", animationDirection: "reverse" }}
              />
            </div>

            {/* Texto simple */}
            <p className="text-white/70 text-sm font-medium">
              Espere por favor...
            </p>
          </div>
        </div>
      )}
    </VersionContext.Provider>
  );
};

export const useVersion = () => useContext(VersionContext);