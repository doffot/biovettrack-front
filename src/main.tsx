// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import Router from "./router";
import { ToastProvider } from "./components/Toast";
import { VersionProvider } from "./contexts/VersionContext"; // 👈 Importa el contexto

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <VersionProvider> {/* 👈 Envuelve tu app con el proveedor */}
          <Router />
        </VersionProvider>
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
);
