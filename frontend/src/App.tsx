import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
const Cadastro = lazy(() => import("./pages/Cadastro"));
const CadastroLote = lazy(() => import("./pages/CadastroLote"));
const ServicoInternoExterno = lazy(() => import("./pages/ServicoInternoExterno"));
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
const Admin = lazy(() => import("./pages/Admin"));
const TecnicoDashboard = lazy(() => import("./pages/TecnicoDashboard"));
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CommandMenu } from "./components/CommandMenu";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CommandMenu />
            <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background font-bold text-muted-foreground">CARREGANDO SISTEMA PMPA...</div>}>
            <Routes>
              {/* Rota Privada: O Login do sistema */}
              <Route path="/login" element={<Login />} />

              {/* Rotas Protegidas e Secretas */}
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/cadastro" element={<ProtectedRoute><Cadastro /></ProtectedRoute>} />
              <Route path="/cadastro-lote" element={<ProtectedRoute><CadastroLote /></ProtectedRoute>} />
              <Route path="/servico-interno-externo" element={<ProtectedRoute><ServicoInternoExterno /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="/tecnico" element={<ProtectedRoute><TecnicoDashboard /></ProtectedRoute>} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
            </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
