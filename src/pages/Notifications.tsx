import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Bell, Heart, MessageCircle, Users, Calendar, Trash2, CheckCheck, Loader2 } from 'lucide-react';
import { Notification } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { notificationsApi } from '@/services/api';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsApi.getUserNotifications(user!.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({ title: 'Error', description: 'Failed to load notifications', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
      toast({ title: 'Error', description: 'Failed to mark as read', variant: 'destructive' });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead(user!.id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast({ title: 'Success', description: 'All notifications marked as read' });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({ title: 'Error', description: 'Failed to mark all as read', variant: 'destructive' });
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationsApi.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast({ title: 'Success', description: 'Notification deleted' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({ title: 'Error', description: 'Failed to delete notification', variant: 'destructive' });
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'pod_join': return <Users className="w-5 h-5" />;
      case 'post_like': return <Heart className="w-5 h-5" />;
      case 'comment': case 'message': return <MessageCircle className="w-5 h-5" />;
      case 'event': case 'pitch': return <Calendar className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
            <h1 className="text-xl font-bold text-foreground">Notifications</h1>
          </div>
          {notifications.some(n => !n.isRead) && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>
      </header>
      <main className="container mx-auto px-4 py-4 max-w-2xl space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No notifications</p>
            <p className="text-sm text-muted-foreground">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((notif) => (
          <Card key={notif.id} className={`${!notif.isRead ? 'border-primary/30 bg-primary/5' : ''}`}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!notif.isRead ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${!notif.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {notif.title}
                </p>
                <p className="text-sm text-muted-foreground">{notif.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatTime(notif.createdAt)}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!notif.isRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleMarkAsRead(notif.id)}
                  >
                    <CheckCheck className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(notif.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )))}
      </main>
    </div>
  );
};

export default Notifications;
