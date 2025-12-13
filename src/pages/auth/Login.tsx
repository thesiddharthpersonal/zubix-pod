import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, loginError, clearLoginError } = useAuth();
  const [formData, setFormData] = useState({
    emailOrMobileOrUsername: '',
    password: '',
  });

  // Show toast when loginError appears from AuthContext
  useEffect(() => {
    if (loginError) {
      toast.error(loginError, { duration: 5000 });
    }
  }, [loginError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearLoginError(); // Clear previous errors
    
    if (!formData.emailOrMobileOrUsername || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    let userData;
    try {
      userData = await login(formData.emailOrMobileOrUsername, formData.password);
    } catch (error: any) {
      // Error is already set in AuthContext
      return;
    }
    
    if (!userData) {
      return;
    }
    
    // Check if pod owner has unapproved pods
    if (userData && (userData as any).role === 'POD_OWNER' && (userData as any).ownedPods?.length > 0) {
      const hasUnapprovedPod = (userData as any).ownedPods.some((pod: any) => !pod.isApproved);
      if (hasUnapprovedPod) {
        navigate('/pending-approval');
        return;
      }
    }
    
    // Check if first time login (by checking if user has lastLoginAt field)
    const isFirstLogin = !(userData as any).lastLoginAt;
    
    // First time users go to discover, returning users go to home
    navigate(isFirstLogin ? '/discover' : '/home');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center">
              <img src="/zubixfavicon.png" alt="Zubix" className="w-12 h-12" />
            </div>
            <span className="text-2xl font-bold text-foreground">Zubix</span>
          </div>

          <Card className="border-border/50 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              {loginError && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{loginError}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emailOrMobileOrUsername">Email, Mobile, or Username</Label>
                  <Input
                    id="emailOrMobileOrUsername"
                    type="text"
                    placeholder="Enter email, mobile, or username"
                    value={formData.emailOrMobileOrUsername}
                    onChange={(e) => {
                      setFormData({ ...formData, emailOrMobileOrUsername: e.target.value });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                    }}
                  />
                </div>

                <Button 
                  type="submit" 
                  variant="hero" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-primary font-medium hover:underline">
                    Sign up
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Login;
