import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import Router from "./router";
import { ToastProvider } from "./components/Toast";

const queryClient = new QueryClient();


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
    <ToastProvider>
      <Router />
    </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
);
