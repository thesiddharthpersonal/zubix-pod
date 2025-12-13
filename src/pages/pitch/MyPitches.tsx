import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import TopNav from '@/components/layout/TopNav';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, MessageCircle, Rocket } from 'lucide-react';
import { pitchesApi } from '@/services/api/pitches';
import { Pitch, STARTUP_STAGE_DISPLAY, PITCH_STATUS_DISPLAY } from '@/types';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
    case 'UNDER_REVIEW': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
    case 'ACCEPTED': return 'bg-green-500/10 text-green-700 dark:text-green-400';
    case 'REJECTED': return 'bg-red-500/10 text-red-700 dark:text-red-400';
    default: return '';
  }
};

const MyPitches = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPitches();
  }, [user]);

  const loadPitches = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await pitchesApi.getUserPitches(user.id);
      setPitches(data);
    } catch (error) {
      console.error('Failed to fetch user pitches:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopNav />
      
      <main className="container mx-auto px-4 pt-20 pb-24">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2"
          onClick={() => navigate('/pitch')}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            My Pitches
          </h1>
          <p className="text-muted-foreground mt-1">
            View and track your submitted pitches and replies
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading pitches...</p>
          </div>
        ) : pitches.length > 0 ? (
          <div className="space-y-4">
            {pitches.map((pitch) => (
              <Card key={pitch.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{pitch.startupName}</h3>
                      <p className="text-sm text-muted-foreground">Sent to {pitch.podName}</p>
                    </div>
                    <Badge className={getStatusColor(pitch.status)}>
                      {PITCH_STATUS_DISPLAY[pitch.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{pitch.summary}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline">{pitch.sector}</Badge>
                    <Badge variant="outline">{STARTUP_STAGE_DISPLAY[pitch.stage]}</Badge>
                    <Badge variant="outline">{pitch.ask}</Badge>
                    {pitch.pitchDeckUrl && (
                      <a
                        href={pitch.pitchDeckUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <FileText className="w-3 h-3" />
                        Pitch Deck
                      </a>
                    )}
                  </div>

                  {/* Show replies from pod owner */}
                  {pitch.replies && pitch.replies.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        Replies ({pitch.replies.length})
                      </p>
                      <div className="space-y-2">
                        {pitch.replies.map((reply) => {
                          const replyDate = typeof reply.createdAt === 'string' ? new Date(reply.createdAt) : reply.createdAt;
                          return (
                            <div key={reply.id} className="bg-secondary/50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-foreground">{reply.author.fullName}</span>
                                <span className="text-xs text-muted-foreground">• {replyDate.toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-foreground">{reply.content}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Rocket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No pitches submitted yet</h3>
              <p className="text-muted-foreground mb-4">Submit your first pitch to get started</p>
              <Button onClick={() => navigate('/pitch/submit')}>
                Submit Your First Pitch
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default MyPitches;
