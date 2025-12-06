import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { UserProfile, Pod } from '@/types';
import { authApi, podsApi, getAuthToken } from '@/services/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  selectedRole: 'user' | 'pod_owner' | null;
  pendingPodOwner: Partial<Pod> | null;
  joinedPods: Pod[];
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  setSelectedRole: (role: 'user' | 'pod_owner') => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  setPendingPodOwner: (data: Partial<Pod>) => void;
  joinPod: (pod: Pod) => void;
  leavePod: (podId: string) => void;
  refreshUser: () => Promise<void>;
}

interface SignupData {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'user' | 'pod_owner' | null>(null);
  const [pendingPodOwner, setPendingPodOwner] = useState<Partial<Pod> | null>(null);
  const [joinedPods, setJoinedPods] = useState<Pod[]>([]);

  // Check for existing auth token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token && !user) {
        try {
          setIsLoading(true);
          const userData = await authApi.getCurrentUser();
          setUser({
            ...userData,
            createdAt: new Date(userData.createdAt),
            socialLinks: {},
          });
          
          // Load user's pods
          const pods = await podsApi.getJoinedPods(userData.id);
          setJoinedPods(pods);
        } catch (error) {
          console.error('Failed to restore session:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.login({
        emailOrMobile: email,
        password,
      });
      
      setUser({
        ...response.user,
        createdAt: new Date(response.user.createdAt),
        socialLinks: {},
      });
      
      // Load user's pods
      const pods = await podsApi.getJoinedPods(response.user.id);
      setJoinedPods(pods);
      
      toast.success('Login successful!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    try {
      setIsLoading(true);
      const response = await authApi.signup(data);
      
      setUser({
        ...response.user,
        createdAt: new Date(response.user.createdAt),
        socialLinks: {},
      });
      
      toast.success('Account created successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
      setUser(null);
      setSelectedRole(null);
      setPendingPodOwner(null);
      setJoinedPods([]);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state even if API call fails
      setUser(null);
      setSelectedRole(null);
      setPendingPodOwner(null);
      setJoinedPods([]);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!user) return;
    
    try {
      const userData = await authApi.getCurrentUser();
      setUser({
        ...userData,
        createdAt: new Date(userData.createdAt),
        socialLinks: {},
      });
      
      // Refresh pods
      const pods = await podsApi.getJoinedPods(userData.id);
      setJoinedPods(pods);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, [user]);

  const updateUserProfile = useCallback((profile: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...profile } : null));
  }, []);

  const joinPod = useCallback(async (pod: Pod) => {
    if (!user) return;
    
    try {
      await podsApi.joinPod(pod.id, user.id);
      setJoinedPods((prev) => {
        if (prev.find((p) => p.id === pod.id)) return prev;
        return [...prev, pod];
      });
      toast.success(`Joined ${pod.name} successfully!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to join pod';
      toast.error(message);
    }
  }, [user]);

  const leavePod = useCallback(async (podId: string) => {
    if (!user) return;
    
    try {
      await podsApi.leavePod(podId, user.id);
      setJoinedPods((prev) => prev.filter((p) => p.id !== podId));
      toast.success('Left pod successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to leave pod';
      toast.error(message);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        selectedRole,
        pendingPodOwner,
        joinedPods,
        login,
        signup,
        logout,
        setSelectedRole,
        updateUserProfile,
        setPendingPodOwner,
        joinPod,
        leavePod,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
