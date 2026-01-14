import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { lazy, Suspense } from "react";
import { HelmetProvider } from 'react-helmet-async';

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AllTickets = lazy(() => import("./pages/AllTickets"));
const TicketDetail = lazy(() => import("./pages/TicketDetail"));
const ImportTicket = lazy(() => import("./pages/ImportTicket"));
const UpdateTicket = lazy(() => import("./pages/UpdateTicket"));
const Reports = lazy(() => import("./pages/Reports"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const Settings = lazy(() => import("./pages/Settings"));
const TeknisiManagement = lazy(() => import("./pages/TeknisiManagement"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/tickets" element={<ProtectedRoute><AllTickets /></ProtectedRoute>} />
        <Route path="/ticket/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
        <Route path="/ticket/:id/update" element={<ProtectedRoute><UpdateTicket /></ProtectedRoute>} />
        <Route path="/import" element={<ProtectedRoute><ImportTicket /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/teknisi" element={<ProtectedRoute><TeknisiManagement /></ProtectedRoute>} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
