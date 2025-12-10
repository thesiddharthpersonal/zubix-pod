import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Building2, Users, ArrowRight } from 'lucide-react';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { setSelectedRole, user } = useAuth();

  const handleRoleSelect = (role: 'user' | 'pod_owner') => {
    setSelectedRole(role);
    if (role === 'user') {
      navigate('/register/user');
    } else {
      navigate('/register/pod-owner');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <main className="relative flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center">
                <img src="/zubixfavicon.png" alt="Zubix" className="w-16 h-16" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Welcome, {user?.fullName || 'there'}!
            </h1>
            <p className="text-muted-foreground text-lg">
              How would you like to use Zubix?
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <RoleCard
              icon={<Users className="w-8 h-8" />}
              title="Join as User"
              description="Discover pods, connect with investors, pitch your startup, and grow your network"
              features={['Join incubators & communities', 'Pitch to investors', 'Attend events', 'Network with founders']}
              onClick={() => handleRoleSelect('user')}
            />
            <RoleCard
              icon={<Building2 className="w-8 h-8" />}
              title="Register as Pod Owner"
              description="Create and manage your own pod to support startups and build a community"
              features={['Create your own pod', 'Review pitches', 'Host events', 'Build your network']}
              onClick={() => handleRoleSelect('pod_owner')}
              isPrimary
            />
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Your username: <span className="font-medium text-foreground">@{user?.username || 'username'}</span>
          </p>
        </div>
      </main>
    </div>
  );
};

const RoleCard = ({
  icon,
  title,
  description,
  features,
  onClick,
  isPrimary,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  onClick: () => void;
  isPrimary?: boolean;
}) => (
  <Card
    className={`relative overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
      isPrimary ? 'border-primary/30 bg-primary/5' : 'border-border'
    }`}
    onClick={onClick}
  >
    {isPrimary && (
      <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
        Popular
      </div>
    )}
    <div className="p-8">
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
          isPrimary ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
        }`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      <ul className="space-y-2 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className={`w-1.5 h-1.5 rounded-full ${isPrimary ? 'bg-primary' : 'bg-muted-foreground'}`} />
            {feature}
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
        Continue
        <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  </Card>
);

export default RoleSelection;
