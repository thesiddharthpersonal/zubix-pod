import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import TopNav from '@/components/layout/TopNav';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus, Trash2, Edit, Eye, ExternalLink, Upload, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { idolPitchDecksApi, uploadApi } from '@/services/api';
import { IdolPitchDeck } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const IdolPitchDecks = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pitchDecks, setPitchDecks] = useState<IdolPitchDeck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDeck, setEditingDeck] = useState<IdolPitchDeck | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    description: '',
    pdfUrl: '',
    thumbnailUrl: '',
  });

  useEffect(() => {
    loadPitchDecks();
  }, []);

  const loadPitchDecks = async () => {
    try {
      setIsLoading(true);
      const data = await idolPitchDecksApi.getAll();
      setPitchDecks(data);
    } catch (error) {
      console.error('Failed to load pitch decks:', error);
      toast.error('Failed to load pitch decks');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    setPdfFile(file);
    
    // Upload immediately
    try {
      setIsUploadingPdf(true);
      const url = await uploadApi.uploadFile(file);
      setFormData({ ...formData, pdfUrl: url });
      toast.success('PDF uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload PDF');
      setPdfFile(null);
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleThumbnailFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size must be less than 5MB');
      return;
    }

    setThumbnailFile(file);
    
    // Upload immediately
    try {
      setIsUploadingThumbnail(true);
      const url = await uploadApi.uploadFile(file);
      setFormData({ ...formData, thumbnailUrl: url });
      toast.success('Thumbnail uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload thumbnail');
      setThumbnailFile(null);
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.companyName || !formData.pdfUrl) {
      toast.error('Please fill in all required fields and upload PDF');
      return;
    }

    if (formData.title.length < 3) {
      toast.error('Title must be at least 3 characters');
      return;
    }

    if (formData.companyName.length < 2) {
      toast.error('Company name must be at least 2 characters');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare data without empty strings
      const submitData = {
        title: formData.title,
        companyName: formData.companyName,
        pdfUrl: formData.pdfUrl,
        description: formData.description || undefined,
        thumbnailUrl: formData.thumbnailUrl || undefined,
      };

      if (editingDeck) {
        await idolPitchDecksApi.update(editingDeck.id, submitData);
        toast.success('Pitch deck updated successfully!');
      } else {
        await idolPitchDecksApi.create(submitData);
        toast.success('Pitch deck uploaded successfully!');
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadPitchDecks();
    } catch (error: any) {
      console.error('Submit error:', error);
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.map((err: any) => err.msg).join(', ');
        toast.error(errorMessages);
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error(editingDeck ? 'Failed to update pitch deck' : 'Failed to upload pitch deck');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (deck: IdolPitchDeck) => {
    setEditingDeck(deck);
    setFormData({
      title: deck.title,
      companyName: deck.companyName,
      description: deck.description || '',
      pdfUrl: deck.pdfUrl,
      thumbnailUrl: deck.thumbnailUrl || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (deckId: string) => {
    if (!confirm('Are you sure you want to delete this pitch deck?')) return;
    
    try {
      await idolPitchDecksApi.delete(deckId);
      toast.success('Pitch deck deleted successfully');
      loadPitchDecks();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete pitch deck');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      companyName: '',
      description: '',
      pdfUrl: '',
      thumbnailUrl: '',
    });
    setPdfFile(null);
    setThumbnailFile(null);
    setEditingDeck(null);
  };

  const handleViewPdf = async (deck: IdolPitchDeck) => {
    window.open(deck.pdfUrl, '_blank');
    // Increment view count in background
    try {
      await idolPitchDecksApi.getById(deck.id);
    } catch (error) {
      console.error('Failed to increment view count:', error);
    }
  };

  // Check if user can manage pitch decks (only pod owners and co-owners)
  const canManage = user?.role === 'POD_OWNER' || user?.role === 'pod_owner';

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopNav />
      
      <main className="container mx-auto px-4 pt-20 pb-24">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Idol Pitch Decks
            </h1>
            <p className="text-muted-foreground mt-1">
              Learn from successful pitch decks of top startups
            </p>
          </div>
          
          {canManage && (
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Pitch Deck
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingDeck ? 'Edit' : 'Upload'} Pitch Deck</DialogTitle>
                  <DialogDescription>
                    Share an inspiring pitch deck with the community
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title * (min 3 characters)</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Airbnb Series A Pitch Deck"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name * (min 2 characters)</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="e.g., Airbnb"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description about this pitch deck..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pdf">Pitch Deck PDF * (max 10MB)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="pdf"
                        type="file"
                        accept=".pdf"
                        onChange={handlePdfFileChange}
                        disabled={isUploadingPdf}
                      />
                      {isUploadingPdf && <span className="text-sm text-muted-foreground">Uploading...</span>}
                    </div>
                    {formData.pdfUrl && (
                      <p className="text-sm text-green-600">✓ PDF uploaded</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">Thumbnail Image (optional, max 5MB)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailFileChange}
                        disabled={isUploadingThumbnail}
                      />
                      {isUploadingThumbnail && <span className="text-sm text-muted-foreground">Uploading...</span>}
                    </div>
                    {formData.thumbnailUrl && (
                      <p className="text-sm text-green-600">✓ Thumbnail uploaded</p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting || isUploadingPdf || isUploadingThumbnail || !formData.pdfUrl} className="flex-1">
                      {isSubmitting ? 'Uploading...' : editingDeck ? 'Update' : 'Upload'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Pitch Decks Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading pitch decks...</p>
          </div>
        ) : pitchDecks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No pitch decks yet</h3>
              <p className="text-muted-foreground mb-4">Be the first to upload an inspiring pitch deck!</p>
              {canManage && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Pitch Deck
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pitchDecks.map((deck) => (
              <Card key={deck.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                {deck.thumbnailUrl && (
                  <div className="aspect-video w-full bg-muted overflow-hidden">
                    <img 
                      src={deck.thumbnailUrl} 
                      alt={deck.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-2">{deck.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">{deck.companyName}</p>
                      </div>
                    </div>
                    {canManage && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(deck)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(deck.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {deck.description && (
                    <CardDescription className="line-clamp-2">
                      {deck.description}
                    </CardDescription>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{deck.viewCount} views</span>
                    </div>
                    <span>{formatDistanceToNow(new Date(deck.createdAt), { addSuffix: true })}</span>
                  </div>
                  
                  <Button 
                    onClick={() => handleViewPdf(deck)}
                    className="w-full"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Pitch Deck
                    <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default IdolPitchDecks;
