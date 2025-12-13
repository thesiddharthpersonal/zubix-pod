import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import TopNav from '@/components/layout/TopNav';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send, Upload, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import { pitchesApi } from '@/services/api/pitches';
import { STARTUP_STAGES, STARTUP_STAGE_DISPLAY, SECTORS, StartupStage } from '@/types';

const SubmitPitch = () => {
  const navigate = useNavigate();
  const { user, joinedPods } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pitchDeckFile, setPitchDeckFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    startupName: '',
    summary: '',
    sector: '',
    stage: '' as StartupStage | '',
    ask: '',
    operatingCity: '',
    website: '',
    contactEmail: user?.email || '',
    contactPhone: user?.mobile || '',
    podId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!formData.podId) {
      toast.error('Please select a pod');
      return;
    }

    if (!formData.startupName.trim()) {
      toast.error('Please enter your startup name');
      return;
    }

    if (!formData.summary.trim()) {
      toast.error('Please provide a pitch summary');
      return;
    }

    if (!formData.sector) {
      toast.error('Please select a sector');
      return;
    }

    if (!formData.stage) {
      toast.error('Please select startup stage');
      return;
    }

    if (!formData.ask.trim()) {
      toast.error('Please specify what you are asking for');
      return;
    }

    if (!formData.operatingCity.trim()) {
      toast.error('Please enter operating city');
      return;
    }

    if (!formData.contactEmail.trim()) {
      toast.error('Please provide contact email');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!formData.contactPhone.trim()) {
      toast.error('Please provide contact phone number');
      return;
    }

    if (!formData.website.trim()) {
      toast.error('Please provide your website');
      return;
    }

    if (!pitchDeckFile) {
      toast.error('Please upload your pitch deck (PDF)');
      return;
    }

    try {
      setLoading(true);
      const pitch = await pitchesApi.createPitch({
        ...formData,
        stage: formData.stage as StartupStage,
      });

      // Upload pitch deck if provided
      if (pitchDeckFile) {
        try {
          await pitchesApi.uploadPitchDeck(pitch.id, pitchDeckFile);
          toast.success('Pitch submitted with deck!');
        } catch (error) {
          console.error('Pitch deck upload error:', error);
          toast.warning('Pitch submitted but deck upload failed');
        }
      } else {
        toast.success('Pitch submitted successfully!');
      }

      // Navigate to my pitches
      navigate('/pitch/my-pitches');
    } catch (error: any) {
      console.error('Failed to create pitch:', error);
      if (error.response?.data?.message) {
        // Show the detailed message from backend
        toast.error(error.response.data.message);
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to submit pitch');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopNav />
      
      <main className="container mx-auto px-4 pt-20 pb-24 max-w-2xl">
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
            <Rocket className="w-6 h-6 text-primary" />
            Submit Your Pitch
          </h1>
          <p className="text-muted-foreground mt-1">
            Submit your startup pitch to investors and pod owners
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Pitch Details
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-2">
              Fields marked with * are required
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Pod *</Label>
                <Select value={formData.podId} onValueChange={(v) => setFormData({ ...formData, podId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose pod" />
                  </SelectTrigger>
                  <SelectContent>
                    {joinedPods.map((p) => (
                      <SelectItem key={p.id} value={p.id} disabled={p.acceptingPitches === false}>
                        {p.name}
                        {p.acceptingPitches === false && ' (Not accepting pitches)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.podId && joinedPods.find(p => p.id === formData.podId)?.acceptingPitches === false && (
                  <p className="text-xs text-destructive">
                    This pod is currently not accepting pitches
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Startup Name *</Label>
                <Input
                  value={formData.startupName}
                  onChange={(e) => setFormData({ ...formData, startupName: e.target.value })}
                  placeholder="Your startup name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Pitch Deck (PDF) *</Label>
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => document.getElementById('pitch-deck-upload')?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {pitchDeckFile ? pitchDeckFile.name : 'Click to upload PDF (Max 10MB)'}
                  </p>
                  <input
                    id="pitch-deck-upload"
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.type !== 'application/pdf') {
                          toast.error('Please select a PDF file');
                          return;
                        }
                        if (file.size > 10 * 1024 * 1024) {
                          toast.error('File size must be less than 10MB');
                          return;
                        }
                        setPitchDeckFile(file);
                        toast.success('PDF selected');
                      }
                    }}
                  />
                </div>
                {pitchDeckFile && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{(pitchDeckFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPitchDeckFile(null);
                        const input = document.getElementById('pitch-deck-upload') as HTMLInputElement;
                        if (input) input.value = '';
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Summary *</Label>
                <Textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  rows={4}
                  placeholder="Brief summary of your startup and what you're building"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sector *</Label>
                  <Select value={formData.sector} onValueChange={(v) => setFormData({ ...formData, sector: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTORS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Stage *</Label>
                  <Select value={formData.stage} onValueChange={(v) => setFormData({ ...formData, stage: v as StartupStage })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {STARTUP_STAGES.map((s) => (
                        <SelectItem key={s} value={s}>{STARTUP_STAGE_DISPLAY[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ask (Funding Amount) *</Label>
                <Input
                  value={formData.ask}
                  onChange={(e) => setFormData({ ...formData, ask: e.target.value })}
                  placeholder="e.g., $500K"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Operating City *</Label>
                <Input
                  value={formData.operatingCity}
                  onChange={(e) => setFormData({ ...formData, operatingCity: e.target.value })}
                  placeholder="City where your startup operates"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Website *</Label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="e.g., yourwebsite.com or https://yourwebsite.com"
                  type="text"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Email *</Label>
                  <Input
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="your@email.com"
                    type="email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone *</Label>
                  <Input
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+91 1234567890"
                    type="tel"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                variant="hero" 
                className="w-full" 
                disabled={loading || (formData.podId && joinedPods.find(p => p.id === formData.podId)?.acceptingPitches === false)}
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Submitting...' : 'Submit Pitch'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default SubmitPitch;
