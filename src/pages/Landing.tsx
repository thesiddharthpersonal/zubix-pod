import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* App Logo and Name */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-block mb-4">
            <img 
              src="/zubixfavicon.png" 
              alt="Zubix" 
              className="w-24 h-24 mx-auto drop-shadow-lg"
            />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Zubix
          </h1>
          <p className="text-muted-foreground text-lg">
            Connect & Grow
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 animate-slide-up stagger-1">
          <Button 
            variant="hero" 
            size="xl" 
            className="w-full h-14 text-lg font-semibold shadow-lg" 
            asChild
          >
            <Link to="/signup">
              Create Account
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            size="xl" 
            className="w-full h-14 text-lg font-semibold border-2" 
            asChild
          >
            <Link to="/login">
              Log In
            </Link>
          </Button>
        </div>

        {/* Tagline */}
        <div className="text-center mt-12 animate-fade-in">
          <p className="text-sm text-muted-foreground">
            Join the startup ecosystem
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            © 2024 Zubix. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
