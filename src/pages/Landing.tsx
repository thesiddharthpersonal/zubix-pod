import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Lightbulb, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl opacity-30" />
        
        <div className="relative container mx-auto px-4 py-8">
          {/* Header */}
          <header className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <img src="/zubixfavicon.png" alt="Zubix" className="w-10 h-10" />
              </div>
              <span className="text-xl font-bold text-foreground">Zubix</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button variant="hero" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          </header>

          {/* Hero Content */}
          <div className="max-w-4xl mx-auto text-center pt-12 pb-24">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Join the Startup Ecosystem
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-slide-up leading-tight">
              Connect, Collaborate &
              <span className="gradient-text"> Grow Together</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up stagger-1">
              Join a thriving community of founders, investors, and innovators. 
              Discover pods, pitch your startup, and build meaningful connections.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up stagger-2">
              <Button variant="hero" size="xl" asChild>
                <Link to="/signup">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/login">I have an account</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our platform brings together all the tools and connections you need to grow your startup
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Join Pods"
              description="Connect with incubators, VCs, angel investors, and accelerators that match your startup's needs"
            />
            <FeatureCard
              icon={<Lightbulb className="w-6 h-6" />}
              title="Pitch & Grow"
              description="Submit your pitch deck directly to interested investors and get valuable feedback"
            />
            <FeatureCard
              icon={<Rocket className="w-6 h-6" />}
              title="Network & Learn"
              description="Participate in events, join rooms, and engage with the community to accelerate your growth"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-primary p-8 md:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-accent opacity-90" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Transform Your Startup Journey?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of founders and investors already building the future together
              </p>
              <Button variant="secondary" size="xl" asChild>
                <Link to="/signup">
                  Create Free Account
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 Zubix. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="bg-card rounded-2xl p-8 border border-border card-hover">
    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Landing;
