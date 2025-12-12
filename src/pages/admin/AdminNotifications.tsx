import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send, Bell, Loader2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/services/api/admin';
import { usersApi } from '@/services/api';

const AdminNotifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    recipientType: 'all', // all, specific, role
    recipientId: '',
    role: '',
    title: '',
    message: '',
    type: 'message' as 'message' | 'event' | 'pitch',
  });

  useEffect(() => {
    if (formData.recipientType === 'specific') {
      fetchUsers();
    }
  }, [formData.recipientType]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const allUsers = await adminApi.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({ title: 'Error', description: 'Failed to load users', variant: 'destructive' });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.message) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    if (formData.recipientType === 'specific' && !formData.recipientId) {
      toast({ title: 'Error', description: 'Please select a user', variant: 'destructive' });
      return;
    }

    if (formData.recipientType === 'role' && !formData.role) {
      toast({ title: 'Error', description: 'Please select a role', variant: 'destructive' });
      return;
    }

    try {
      setSending(true);
      await adminApi.sendNotification({
        recipientType: formData.recipientType,
        recipientId: formData.recipientId || undefined,
        role: formData.role || undefined,
        title: formData.title,
        message: formData.message,
        type: formData.type,
      });

      toast({ title: 'Success', description: 'Notification sent successfully!' });
      
      // Reset form
      setFormData({
        recipientType: 'all',
        recipientId: '',
        role: '',
        title: '',
        message: '',
        type: 'message',
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({ title: 'Error', description: 'Failed to send notification', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Send Notifications</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Custom Notification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              {/* Recipient Type */}
              <div className="space-y-2">
                <Label htmlFor="recipientType">Send To</Label>
                <Select
                  value={formData.recipientType}
                  onValueChange={(value) => setFormData({ ...formData, recipientType: value, recipientId: '', role: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="specific">Specific User</SelectItem>
                    <SelectItem value="role">By Role</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Specific User Selection */}
              {formData.recipientType === 'specific' && (
                <div className="space-y-2">
                  <Label htmlFor="recipientId">Select User</Label>
                  {loadingUsers ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading users...
                    </div>
                  ) : (
                    <Select
                      value={formData.recipientId}
                      onValueChange={(value) => setFormData({ ...formData, recipientId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.fullName} (@{user.username})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {/* Role Selection */}
              {formData.recipientType === 'role' && (
                <div className="space-y-2">
                  <Label htmlFor="role">Select Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">Regular Users</SelectItem>
                      <SelectItem value="POD_OWNER">Pod Owners</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Notification Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Notification Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Notification</SelectItem>
                    <SelectItem value="message">Message</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="pitch">Pitch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter notification title"
                  required
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter notification message"
                  rows={4}
                  required
                />
              </div>

              {/* Preview */}
              {(formData.title || formData.message) && (
                <div className="p-4 bg-secondary rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                  <div className="space-y-1">
                    <p className="font-semibold">{formData.title || 'Title will appear here'}</p>
                    <p className="text-sm text-muted-foreground">{formData.message || 'Message will appear here'}</p>
                  </div>
                </div>
              )}

              {/* Send Button */}
              <Button type="submit" className="w-full" disabled={sending}>
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Notification
                  </>
                )}
              </Button>

              {/* Info */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  {formData.recipientType === 'all' && 'This notification will be sent to all users.'}
                  {formData.recipientType === 'specific' && 'This notification will be sent to the selected user.'}
                  {formData.recipientType === 'role' && formData.role === 'USER' && 'This notification will be sent to all regular users.'}
                  {formData.recipientType === 'role' && formData.role === 'POD_OWNER' && 'This notification will be sent to all pod owners.'}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminNotifications;
