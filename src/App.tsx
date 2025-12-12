import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import ProfileSetup from "@/pages/auth/ProfileSetup";
import RoleSelection from "@/pages/auth/RoleSelection";
import UserRegistration from "@/pages/register/UserRegistration";
import PodOwnerRegistration from "@/pages/register/PodOwnerRegistration";
import PendingApproval from "@/pages/PendingApproval";
import PodDiscovery from "@/pages/discover/PodDiscovery";
import Home from "@/pages/home/Home";
import PostDetail from "@/pages/PostDetail";
import Rooms from "@/pages/rooms/Rooms";
import RoomChat from "@/pages/rooms/RoomChat";
import RoomQA from "@/pages/rooms/RoomQA";
import RoomJoinRequests from "@/pages/rooms/RoomJoinRequests";
import RoomMembers from "@/pages/rooms/RoomMembers";
import Events from "@/pages/events/Events";
import More from "@/pages/more/More";
import EditPod from "@/pages/more/EditPod";
import Chat from "@/pages/chat/Chat";
import MessageRequests from "@/pages/chat/MessageRequests";
import BookCall from "@/pages/calls/BookCall";
import Profile from "@/pages/profile/Profile";
import EditProfile from "@/pages/profile/EditProfile";
import Search from "@/pages/Search";
import Notifications from "@/pages/Notifications";
import StartupIdeas from "@/pages/StartupIdeas";
import JobsInternships from "@/pages/JobsInternships";
import IdolPitchDecks from "@/pages/IdolPitchDecks";
import Admin from "@/pages/admin/Admin";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminPods from "@/pages/admin/AdminPods";
import AdminLogin from "@/pages/admin/AdminLogin";
import NotFound from "@/pages/NotFound";
import Install from "@/pages/Install";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) return <Navigate to="/" replace />;
  
  // Check if pod owner has unapproved pods
  if (user?.role === 'POD_OWNER' && user?.ownedPods && user.ownedPods.length > 0) {
    const hasUnapprovedPod = user.ownedPods.some((pod: any) => !pod.isApproved);
    // Allow access to pending-approval page, but block other pages
    if (hasUnapprovedPod && location.pathname !== '/pending-approval') {
      return <Navigate to="/pending-approval" replace />;
    }
  }
  
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
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
      <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
      <Route path="/role-selection" element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />
      <Route path="/register/user" element={<ProtectedRoute><UserRegistration /></ProtectedRoute>} />
      <Route path="/register/pod-owner" element={<ProtectedRoute><PodOwnerRegistration /></ProtectedRoute>} />
      <Route path="/pending-approval" element={<ProtectedRoute><PendingApproval /></ProtectedRoute>} />

      {/* Main App Routes */}
      <Route path="/discover" element={<ProtectedRoute><PodDiscovery /></ProtectedRoute>} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/post/:postId" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
      <Route path="/rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>} />
      <Route path="/rooms/:roomId/chat" element={<ProtectedRoute><RoomChat /></ProtectedRoute>} />
      <Route path="/rooms/:roomId/qa" element={<ProtectedRoute><RoomQA /></ProtectedRoute>} />
      <Route path="/rooms/:roomId/join-requests" element={<ProtectedRoute><RoomJoinRequests /></ProtectedRoute>} />
      <Route path="/rooms/:roomId/members" element={<ProtectedRoute><RoomMembers /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
      <Route path="/more" element={<ProtectedRoute><More /></ProtectedRoute>} />
      <Route path="/pods/:podId/edit" element={<ProtectedRoute><EditPod /></ProtectedRoute>} />
      <Route path="/startup-ideas" element={<ProtectedRoute><StartupIdeas /></ProtectedRoute>} />
      <Route path="/jobs-internships" element={<ProtectedRoute><JobsInternships /></ProtectedRoute>} />
      <Route path="/idol-pitch-decks" element={<ProtectedRoute><IdolPitchDecks /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/message-requests" element={<ProtectedRoute><MessageRequests /></ProtectedRoute>} />
      <Route path="/book-call" element={<ProtectedRoute><BookCall /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
      <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/pod/:podId" element={<ProtectedRoute><PodDiscovery /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminProtectedRoute><Admin /></AdminProtectedRoute>} />
      <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
      <Route path="/admin/pods" element={<AdminProtectedRoute><AdminPods /></AdminProtectedRoute>} />

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
      <AdminAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AdminAuthProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
