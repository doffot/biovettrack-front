// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import Router from "./router";
import { ToastProvider } from "./components/Toast";
import { VersionProvider } from "./contexts/VersionContext";
import { ThemeProvider } from "./constants/ThemeContext";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider> 
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <VersionProvider> 
            <Router />
          </VersionProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider> 
  </StrictMode>,
);