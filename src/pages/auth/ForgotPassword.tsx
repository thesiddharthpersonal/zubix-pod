import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailOrMobile.trim()) {
      toast.error('Please enter your email or mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.forgotPassword(emailOrMobile);
      toast.success('OTP sent successfully!');
      
      // Show development OTP if available
      if (response.developmentOTP) {
        toast.info(`Development OTP: ${response.developmentOTP}`, { duration: 10000 });
      }
      
      // Navigate to reset password page with email/mobile
      navigate('/reset-password', { state: { emailOrMobile } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/login">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
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
              <CardTitle className="text-2xl">Forgot Password</CardTitle>
              <CardDescription>
                Enter your email or mobile number to receive a password reset OTP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emailOrMobile">Email or Mobile Number</Label>
                  <Input
                    id="emailOrMobile"
                    type="text"
                    placeholder="Enter email or mobile"
                    value={emailOrMobile}
                    onChange={(e) => setEmailOrMobile(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  Remember your password?{' '}
                  <Link to="/login" className="text-primary font-medium hover:underline">
                    Login
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

export default ForgotPassword;
