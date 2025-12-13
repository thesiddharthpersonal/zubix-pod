import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import TopNav from '@/components/layout/TopNav';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, FileText, Inbox, ArrowLeft, ChevronRight } from 'lucide-react';
import { getManagedPods } from '@/lib/utils';

const PitchOptions = () => {
  const navigate = useNavigate();
  const { user, joinedPods } = useAuth();
  
  // Check if user is pod owner/co-owner
  const isPodOwner = getManagedPods(joinedPods, user?.id).length > 0;

  const options = [
    {
      id: 'submit',
      title: 'Submit Pitch',
      description: 'Submit your startup pitch to investors and pod owners',
      icon: Send,
      path: '/pitch/submit',
      available: true,
    },
    {
      id: 'my-pitches',
      title: 'My Pitches',
      description: 'View and track your submitted pitches and replies',
      icon: FileText,
      path: '/pitch/my-pitches',
      available: true,
    },
    {
      id: 'received',
      title: 'Received Pitches',
      description: 'Review pitches received from startups (Pod Owners only)',
      icon: Inbox,
      path: '/pitch/received',
      available: isPodOwner,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopNav />
      
      <main className="container mx-auto px-4 pt-20 pb-24">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2"
          onClick={() => navigate('/more')}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to More
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Pitch Module</h1>
          <p className="text-muted-foreground">
            Choose an option to manage your startup pitches
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {options.map((option) => {
            const Icon = option.icon;
            
            if (!option.available) return null;

            return (
              <Card
                key={option.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 group"
                onClick={() => navigate(option.path)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <CardTitle className="text-xl">{option.title}</CardTitle>
                  <CardDescription className="text-sm mt-2">
                    {option.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {!isPodOwner && (
          <Card className="mt-6 border-muted">
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground text-center">
                <Inbox className="w-4 h-4 inline mr-1" />
                Received Pitches option is available for Pod Owners and Co-Owners only
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default PitchOptions;
