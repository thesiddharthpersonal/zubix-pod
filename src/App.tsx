import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import RoleSelection from "@/pages/auth/RoleSelection";
import UserRegistration from "@/pages/register/UserRegistration";
import PodOwnerRegistration from "@/pages/register/PodOwnerRegistration";
import PendingApproval from "@/pages/PendingApproval";
import PodDiscovery from "@/pages/discover/PodDiscovery";
import Home from "@/pages/home/Home";
import Rooms from "@/pages/rooms/Rooms";
import RoomChat from "@/pages/rooms/RoomChat";
import RoomQA from "@/pages/rooms/RoomQA";
import Events from "@/pages/events/Events";
import Others from "@/pages/others/Others";
import Chat from "@/pages/chat/Chat";
import MessageRequests from "@/pages/chat/MessageRequests";
import BookCall from "@/pages/calls/BookCall";
import Profile from "@/pages/profile/Profile";
import Search from "@/pages/Search";
import Notifications from "@/pages/Notifications";
import NotFound from "@/pages/NotFound";
import Install from "@/pages/Install";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/home" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* Auth Flow Routes */}
      <Route path="/role-selection" element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />
      <Route path="/register/user" element={<ProtectedRoute><UserRegistration /></ProtectedRoute>} />
      <Route path="/register/pod-owner" element={<ProtectedRoute><PodOwnerRegistration /></ProtectedRoute>} />
      <Route path="/pending-approval" element={<ProtectedRoute><PendingApproval /></ProtectedRoute>} />

      {/* Main App Routes */}
      <Route path="/discover" element={<ProtectedRoute><PodDiscovery /></ProtectedRoute>} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>} />
      <Route path="/rooms/:roomId/chat" element={<ProtectedRoute><RoomChat /></ProtectedRoute>} />
      <Route path="/rooms/:roomId/qa" element={<ProtectedRoute><RoomQA /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
      <Route path="/others" element={<ProtectedRoute><Others /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/message-requests" element={<ProtectedRoute><MessageRequests /></ProtectedRoute>} />
      <Route path="/book-call" element={<ProtectedRoute><BookCall /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

      {/* Install Page */}
      <Route path="/install" element={<Install />} />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
