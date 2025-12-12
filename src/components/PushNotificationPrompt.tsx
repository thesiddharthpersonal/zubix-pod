import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, X } from 'lucide-react';
import { PushNotificationManager } from '@/services/pushNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const PushNotificationPrompt = () => {
  const [show, setShow] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const pushManager = PushNotificationManager.getInstance();

  useEffect(() => {
    // Only show prompt for authenticated users
    if (isAuthenticated) {
      checkNotificationStatus();
    }
  }, [isAuthenticated]);

  const checkNotificationStatus = async () => {
    const permission = pushManager.getPermission();
    const subscribed = await pushManager.isSubscribed();
    
    console.log('🔔 Notification status check:', { permission, subscribed, isAuthenticated });
    
    setIsSubscribed(subscribed);
    
    // Show prompt if permission is default (not asked yet) and not subscribed
    if (permission === 'default' && !subscribed) {
      console.log('📢 Showing notification prompt in 5 seconds...');
      // Wait a bit before showing to avoid overwhelming the user
      setTimeout(() => {
        console.log('✅ Displaying notification prompt now');
        setShow(true);
      }, 5000);
    } else {
      console.log('ℹ️ Not showing prompt. Permission:', permission, 'Subscribed:', subscribed);
    }
  };

  const handleEnable = async () => {
    setIsLoading(true);
    try {
      const success = await pushManager.subscribe();
      if (success) {
        setIsSubscribed(true);
        setShow(false);
        toast.success('🔔 Push notifications enabled!', {
          description: 'You\'ll now receive updates even when the app is closed.'
        });
      } else {
        toast.error('Failed to enable notifications', {
          description: 'Please check your browser settings and try again.'
        });
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error('Something went wrong', {
        description: 'Unable to enable push notifications.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    // Remember user dismissed (you could store this in localStorage)
    localStorage.setItem('push-notification-dismissed', Date.now().toString());
  };

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (isSubscribed) {
        const success = await pushManager.unsubscribe();
        if (success) {
          setIsSubscribed(false);
          toast.success('🔕 Push notifications disabled');
        }
      } else {
        const success = await pushManager.subscribe();
        if (success) {
          setIsSubscribed(true);
          toast.success('🔔 Push notifications enabled!');
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast.error('Failed to update notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 sm:left-auto sm:right-4 sm:bottom-4 sm:w-96">
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Enable Notifications</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1"
              onClick={handleDismiss}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>
            Stay updated with real-time notifications even when the app is closed
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            variant="hero"
            className="flex-1"
            onClick={handleEnable}
            disabled={isLoading}
          >
            <Bell className="w-4 h-4 mr-2" />
            {isLoading ? 'Enabling...' : 'Enable'}
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            disabled={isLoading}
          >
            Maybe Later
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Settings component for managing notifications
export const PushNotificationSettings = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const pushManager = PushNotificationManager.getInstance();

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const perm = pushManager.getPermission();
    const subscribed = await pushManager.isSubscribed();
    setPermission(perm);
    setIsSubscribed(subscribed);
  };

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (isSubscribed) {
        const success = await pushManager.unsubscribe();
        if (success) {
          setIsSubscribed(false);
          toast.success('🔕 Push notifications disabled');
        }
      } else {
        const success = await pushManager.subscribe();
        if (success) {
          setIsSubscribed(true);
          setPermission('granted');
          toast.success('🔔 Push notifications enabled!');
        } else {
          toast.error('Failed to enable notifications', {
            description: 'Please check your browser settings.'
          });
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast.error('Failed to update notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Simple inline version without Card wrapper
  if (window.location.pathname === '/notifications') {
    return (
      <Button
        variant={isSubscribed ? 'outline' : 'default'}
        size="sm"
        onClick={handleToggle}
        disabled={isLoading || permission === 'denied'}
        className="shrink-0"
      >
        {isLoading ? (
          'Loading...'
        ) : isSubscribed ? (
          <>
            <Bell className="w-4 h-4 mr-2" />
            On
          </>
        ) : (
          <>
            <BellOff className="w-4 h-4 mr-2" />
            Off
          </>
        )}
      </Button>
    );
  }

  // Full card version for settings page
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSubscribed ? (
            <Bell className="w-5 h-5 text-primary" />
          ) : (
            <BellOff className="w-5 h-5 text-muted-foreground" />
          )}
          Push Notifications
        </CardTitle>
        <CardDescription>
          Receive notifications even when the app is closed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">
              Status: {isSubscribed ? 'Enabled' : 'Disabled'}
            </p>
            <p className="text-xs text-muted-foreground">
              {permission === 'granted'
                ? '✅ Browser permission granted'
                : permission === 'denied'
                ? '❌ Browser permission denied'
                : '⏳ Permission not requested yet'}
            </p>
          </div>
          <Button
            variant={isSubscribed ? 'outline' : 'hero'}
            onClick={handleToggle}
            disabled={isLoading || permission === 'denied'}
          >
            {isLoading
              ? 'Loading...'
              : isSubscribed
              ? 'Disable'
              : 'Enable'}
          </Button>
        </div>
        {permission === 'denied' && (
          <p className="mt-3 text-xs text-destructive">
            ⚠️ Notifications are blocked. To enable: Chrome → Settings → Privacy → Site Settings → Notifications → Allow for {window.location.origin}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
