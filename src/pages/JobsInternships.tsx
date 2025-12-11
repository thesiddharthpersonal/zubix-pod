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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Briefcase, Trash2, Edit, User as UserIcon, FileText, Mail, Phone, ExternalLink, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { jobsApi, uploadApi } from '@/services/api';
import { JobApplication, JobType } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const DOMAINS = [
  'Software Development',
  'Data Science',
  'Product Management',
  'Design (UI/UX)',
  'Marketing',
  'Sales',
  'Finance',
  'Human Resources',
  'Operations',
  'Business Development',
  'Content Writing',
  'Customer Support',
  'Other'
];

const JobsInternships = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'JOB' | 'INTERNSHIP'>('JOB');
  
  const [formData, setFormData] = useState({
    candidateName: user?.fullName || '',
    type: 'JOB' as JobType,
    domain: '',
    brief: '',
    resumeUrl: '',
    contactEmail: user?.email || '',
    contactPhone: user?.mobile || '',
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      const data = await jobsApi.getAll();
      setApplications(data);
    } catch (error) {
      console.error('Failed to load applications:', error);
      toast.error('Failed to load job applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setResumeFile(file);
    
    // Upload immediately
    try {
      setIsUploading(true);
      const url = await uploadApi.uploadFile(file);
      setFormData({ ...formData, resumeUrl: url });
      toast.success('Resume uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload resume');
      setResumeFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.candidateName || !formData.domain || !formData.brief || !formData.resumeUrl) {
      toast.error('Please fill in all required fields and upload resume');
      return;
    }

    if (formData.candidateName.length < 2) {
      toast.error('Candidate name must be at least 2 characters');
      return;
    }

    if (formData.brief.length < 10) {
      toast.error('Brief must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (editingApplication) {
        await jobsApi.update(editingApplication.id, formData);
        toast.success('Application updated successfully!');
      } else {
        await jobsApi.create(formData);
        toast.success('Application posted successfully!');
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadApplications();
    } catch (error: any) {
      console.error('Submit error:', error);
      
      // Display specific validation errors from backend
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.map((err: any) => err.msg).join(', ');
        toast.error(errorMessages);
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error(editingApplication ? 'Failed to update application' : 'Failed to post application');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (application: JobApplication) => {
    setEditingApplication(application);
    setFormData({
      candidateName: application.candidateName,
      type: application.type,
      domain: application.domain,
      brief: application.brief,
      resumeUrl: application.resumeUrl,
      contactEmail: application.contactEmail || '',
      contactPhone: application.contactPhone || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (applicationId: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    
    try {
      await jobsApi.delete(applicationId);
      toast.success('Application deleted successfully');
      loadApplications();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete application');
    }
  };

  const resetForm = () => {
    setFormData({
      candidateName: user?.fullName || '',
      type: 'JOB',
      domain: '',
      brief: '',
      resumeUrl: '',
      contactEmail: user?.email || '',
      contactPhone: user?.mobile || '',
    });
    setResumeFile(null);
    setEditingApplication(null);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopNav />
      
      <main className="container mx-auto px-4 pt-20 pb-24">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-primary" />
              Jobs & Internships
            </h1>
            <p className="text-muted-foreground mt-1">
              Post your availability and discover opportunities
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Post Availability
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingApplication ? 'Edit' : 'Post'} Your Availability</DialogTitle>
                <DialogDescription>
                  Share your profile for job or internship opportunities
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="candidateName">Candidate Name * (min 2 characters)</Label>
                  <Input
                    id="candidateName"
                    value={formData.candidateName}
                    onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Looking for *</Label>
                  <Select value={formData.type} onValueChange={(value: JobType) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JOB">Job</SelectItem>
                      <SelectItem value="INTERNSHIP">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Domain *</Label>
                  <Select value={formData.domain} onValueChange={(value) => setFormData({ ...formData, domain: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOMAINS.map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          {domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brief">Brief About Yourself * (min 10 characters)</Label>
                  <Textarea
                    id="brief"
                    value={formData.brief}
                    onChange={(e) => setFormData({ ...formData, brief: e.target.value })}
                    placeholder="Describe your skills, experience, and what you're looking for..."
                    rows={4}
                    required
                  />
                  <p className="text-xs text-muted-foreground">{formData.brief.length} / 10 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resume">Resume (PDF) *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                    {isUploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
                  </div>
                  {formData.resumeUrl && (
                    <p className="text-sm text-green-600">✓ Resume uploaded</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || isUploading || !formData.resumeUrl} className="flex-1">
                    {isSubmitting ? 'Posting...' : editingApplication ? 'Update' : 'Post'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs for Jobs and Internships */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'JOB' | 'INTERNSHIP')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="JOB">Jobs</TabsTrigger>
            <TabsTrigger value="INTERNSHIP">Internships</TabsTrigger>
          </TabsList>

          <TabsContent value="JOB">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading jobs...</p>
              </div>
            ) : applications.filter(app => app.type === 'JOB').length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No job postings yet</h3>
                  <p className="text-muted-foreground mb-4">Be the first to post your job availability!</p>
                  <Button onClick={() => {
                    setFormData({ ...formData, type: 'JOB' });
                    setIsDialogOpen(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Post Job Availability
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {applications.filter(app => app.type === 'JOB').map((application) => (
              <Card key={application.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={application.user.profilePhoto} />
                        <AvatarFallback>
                          <UserIcon className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{application.candidateName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    {user?.id === application.userId && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(application)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(application.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mb-2">
                    <Badge variant={application.type === 'JOB' ? 'default' : 'secondary'}>
                      {application.type === 'JOB' ? 'Job' : 'Internship'}
                    </Badge>
                    <Badge variant="outline">{application.domain}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription className="line-clamp-3">
                    {application.brief}
                  </CardDescription>
                  
                  <div className="space-y-2 pt-2 border-t">
                    <a
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      View Resume
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    
                    {application.contactEmail && (
                      <a
                        href={`mailto:${application.contactEmail}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <Mail className="w-4 h-4" />
                        {application.contactEmail}
                      </a>
                    )}
                    
                    {application.contactPhone && (
                      <a
                        href={`tel:${application.contactPhone}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <Phone className="w-4 h-4" />
                        {application.contactPhone}
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="INTERNSHIP">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading internships...</p>
              </div>
            ) : applications.filter(app => app.type === 'INTERNSHIP').length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No internship postings yet</h3>
                  <p className="text-muted-foreground mb-4">Be the first to post your internship availability!</p>
                  <Button onClick={() => {
                    setFormData({ ...formData, type: 'INTERNSHIP' });
                    setIsDialogOpen(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Post Internship Availability
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {applications.filter(app => app.type === 'INTERNSHIP').map((application) => (
                  <Card key={application.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={application.user.profilePhoto} />
                            <AvatarFallback>
                              <UserIcon className="w-5 h-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{application.candidateName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        {user?.id === application.userId && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(application)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(application.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mb-2">
                        <Badge variant={application.type === 'JOB' ? 'default' : 'secondary'}>
                          {application.type === 'JOB' ? 'Job' : 'Internship'}
                        </Badge>
                        <Badge variant="outline">{application.domain}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <CardDescription className="line-clamp-3">
                        {application.brief}
                      </CardDescription>
                      
                      <div className="space-y-2 pt-2 border-t">
                        <a
                          href={application.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <FileText className="w-4 h-4" />
                          View Resume
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        
                        {application.contactEmail && (
                          <a
                            href={`mailto:${application.contactEmail}`}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                          >
                            <Mail className="w-4 h-4" />
                            {application.contactEmail}
                          </a>
                        )}
                        
                        {application.contactPhone && (
                          <a
                            href={`tel:${application.contactPhone}`}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                          >
                            <Phone className="w-4 h-4" />
                            {application.contactPhone}
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default JobsInternships;
