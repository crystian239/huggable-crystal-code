import { useEffect, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/data/authStore";
import { SeedTestData } from "@/components/SeedTestData";
import { updateActivity, isSessionExpired } from "@/lib/security";
import { toast } from "sonner";
import { useCrossTabSync } from "@/hooks/useCrossTabSync";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PatientsPage from "./pages/PatientsPage";
import AgendaPage from "./pages/AgendaPage";
import FinanceiroPage from "./pages/FinanceiroPage";
import ProntuariosPage from "./pages/ProntuariosPage";
import RecibosPage from "./pages/RecibosPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import MensagensPage from "./pages/MensagensPage";
import AniversariosPage from "./pages/AniversariosPage";
import TeleconsultaPage from "./pages/TeleconsultaPage";
import VideoCallPage from "./pages/VideoCallPage";
import PatientPortalPage from "./pages/PatientPortalPage";
import SuportePage from "./pages/SuportePage";
import AtestadosPage from "./pages/AtestadosPage";
import AtividadesPage from "./pages/AtividadesPage";
import NotaFiscalPage from "./pages/NotaFiscalPage";
import AvisosPage from "./pages/AvisosPage";
import TutorialPage from "./pages/TutorialPage";
import AdminPanelPage from "./pages/AdminPanelPage";
import AdminMedicosPage from "./pages/admin/AdminMedicosPage";
import AdminCadastrosPage from "./pages/admin/AdminCadastrosPage";
import AdminSuportePage from "./pages/admin/AdminSuportePage";
import AdminClinicaPage from "./pages/admin/AdminClinicaPage";
import AdminLogsPage from "./pages/admin/AdminLogsPage";
import AdminUsuariosPage from "./pages/admin/AdminUsuariosPage";
import ChatAdminPage from "./pages/ChatAdminPage";
import LivePage from "./pages/LivePage";
import GaleriaPage from "./pages/GaleriaPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  // Session timeout check
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      if (isSessionExpired()) {
        logout();
        toast.error("Sessão expirada por inatividade. Faça login novamente.");
      }
    }, 60000); // check every minute
    return () => clearInterval(interval);
  }, [isAuthenticated, logout]);

  // Track user activity
  const handleActivity = useCallback(() => updateActivity(), []);
  useEffect(() => {
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, handleActivity));
    return () => events.forEach((e) => window.removeEventListener(e, handleActivity));
  }, [handleActivity]);

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  // Sync teleconsulta state (activeCall, etc.) across browser tabs
  useCrossTabSync();

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <SeedTestData />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/pacientes" element={<ProtectedRoute><PatientsPage /></ProtectedRoute>} />
          <Route path="/agenda" element={<ProtectedRoute><AgendaPage /></ProtectedRoute>} />
          <Route path="/financeiro" element={<ProtectedRoute><FinanceiroPage /></ProtectedRoute>} />
          <Route path="/prontuarios" element={<ProtectedRoute><ProntuariosPage /></ProtectedRoute>} />
          <Route path="/recibos" element={<ProtectedRoute><RecibosPage /></ProtectedRoute>} />
          <Route path="/mensagens" element={<ProtectedRoute><MensagensPage /></ProtectedRoute>} />
          <Route path="/aniversarios" element={<ProtectedRoute><AniversariosPage /></ProtectedRoute>} />
          <Route path="/teleconsulta" element={<ProtectedRoute><TeleconsultaPage /></ProtectedRoute>} />
          <Route path="/teleconsulta/sala/:roomName" element={<VideoCallPage />} />
          <Route path="/suporte" element={<ProtectedRoute><SuportePage /></ProtectedRoute>} />
          <Route path="/atestados" element={<ProtectedRoute><AtestadosPage /></ProtectedRoute>} />
          <Route path="/atividades" element={<ProtectedRoute><AtividadesPage /></ProtectedRoute>} />
          <Route path="/notas-fiscais" element={<ProtectedRoute><NotaFiscalPage /></ProtectedRoute>} />
          <Route path="/avisos" element={<ProtectedRoute><AvisosPage /></ProtectedRoute>} />
          <Route path="/tutorial" element={<ProtectedRoute><TutorialPage /></ProtectedRoute>} />
          <Route path="/chat-admin" element={<ProtectedRoute><ChatAdminPage /></ProtectedRoute>} />
          <Route path="/live" element={<ProtectedRoute><LivePage /></ProtectedRoute>} />
          <Route path="/galeria" element={<ProtectedRoute><GaleriaPage /></ProtectedRoute>} />
          <Route path="/portal-paciente" element={<PatientPortalPage />} />
          <Route path="/admin" element={<ProtectedRoute><AdminPanelPage /></ProtectedRoute>} />
          <Route path="/admin/medicos" element={<ProtectedRoute><AdminMedicosPage /></ProtectedRoute>} />
          <Route path="/admin/cadastros" element={<ProtectedRoute><AdminCadastrosPage /></ProtectedRoute>} />
          <Route path="/admin/suporte" element={<ProtectedRoute><AdminSuportePage /></ProtectedRoute>} />
          <Route path="/admin/clinica" element={<ProtectedRoute><AdminClinicaPage /></ProtectedRoute>} />
          <Route path="/admin/logs" element={<ProtectedRoute><AdminLogsPage /></ProtectedRoute>} />
          <Route path="/admin/usuarios" element={<ProtectedRoute><AdminUsuariosPage /></ProtectedRoute>} />
          <Route path="/configuracoes" element={<ProtectedRoute><ConfiguracoesPage /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/portal-paciente" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
}

export default App;
