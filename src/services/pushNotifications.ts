import apiClient, { handleApiError } from './api/config';

export const pushNotificationApi = {
  // Get VAPID public key
  getVapidPublicKey: async (): Promise<string> => {
    try {
      const response = await apiClient.get<{ publicKey: string }>('/api/push/vapid-public-key');
      return response.data.publicKey;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Subscribe to push notifications
  subscribe: async (subscription: PushSubscription): Promise<void> => {
    try {
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: arrayBufferToBase64(subscription.getKey('auth'))
        }
      };
      
      await apiClient.post('/api/push/subscribe', subscriptionData);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Unsubscribe from push notifications
  unsubscribe: async (endpoint: string): Promise<void> => {
    try {
      await apiClient.post('/api/push/unsubscribe', { endpoint });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get user's subscriptions
  getSubscriptions: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get<{ subscriptions: any[] }>('/api/push/subscriptions');
      return response.data.subscriptions;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Push notification manager
export class PushNotificationManager {
  private static instance: PushNotificationManager;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {}

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  // Initialize push notifications
  async initialize(): Promise<boolean> {
    try {
      // Check if service worker is supported
      if (!('serviceWorker' in navigator)) {
        console.warn('Service Worker not supported');
        return false;
      }

      // Check if push notifications are supported
      if (!('PushManager' in window)) {
        console.warn('Push notifications not supported');
        return false;
      }

      // Get service worker registration
      this.registration = await navigator.serviceWorker.ready;
      console.log('✅ Push notification manager initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    try {
      console.log('🔔 Requesting notification permission...');
      
      if (!('Notification' in window)) {
        console.error('❌ Notifications not supported in this browser');
        throw new Error('Notifications not supported');
      }

      console.log('📱 Current permission state:', Notification.permission);
      
      if (Notification.permission === 'denied') {
        console.error('❌ Notification permission was previously denied. User must reset in browser settings.');
        return 'denied';
      }

      const permission = await Notification.requestPermission();
      console.log('✅ Notification permission result:', permission);
      return permission;
    } catch (error) {
      console.error('❌ Failed to request permission:', error);
      return 'denied';
    }
  }

  // Subscribe to push notifications
  async subscribe(): Promise<boolean> {
    try {
      console.log('📤 Starting push notification subscription process...');
      
      // Check if this is Safari on iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
      if (isIOS && isSafari) {
        console.warn('⚠️ Safari/iOS push notifications require APNs setup');
        alert('Push notifications are currently only supported on Chrome and Android browsers. Safari/iOS support coming soon!');
        return false;
      }
      
      if (!this.registration) {
        console.log('🔄 Initializing service worker...');
        await this.initialize();
        if (!this.registration) {
          throw new Error('Service worker not registered');
        }
      }

      console.log('✅ Service worker ready:', !!this.registration);

      // First unsubscribe any existing subscription to reset
      console.log('🔄 Removing old subscription if exists...');
      const oldSubscription = await this.registration.pushManager.getSubscription();
      if (oldSubscription) {
        await oldSubscription.unsubscribe();
        console.log('🗑️ Old subscription removed');
      }

      // Check permission
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('⚠️ Notification permission not granted:', permission);
        return false;
      }

      console.log('🆕 Creating fresh push subscription...');
      const publicKey = await pushNotificationApi.getVapidPublicKey();
      console.log('🔑 Got VAPID key:', publicKey.substring(0, 20) + '...');
      
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      console.log('✅ Created new push subscription:', subscription.endpoint.substring(0, 50) + '...');

      // Send subscription to backend
      await pushNotificationApi.subscribe(subscription);
      console.log('✅ Push subscription sent to server');
      
      // Test the subscription immediately
      console.log('🧪 Testing notification...');
      await this.registration.showNotification('Zubix Notifications Enabled! 🎉', {
        body: 'You will now receive push notifications',
        icon: '/pwa-192x192.png',
        badge: '/zubixfavicon.png',
        tag: 'test-notification',
        requireInteraction: false
      });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to subscribe:', error);
      return false;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<boolean> {
    try {
      if (!this.registration) {
        return true; // Already unsubscribed
      }

      const subscription = await this.registration.pushManager.getSubscription();
      if (!subscription) {
        return true; // No subscription exists
      }

      // Unsubscribe from backend
      await pushNotificationApi.unsubscribe(subscription.endpoint);

      // Unsubscribe from browser
      await subscription.unsubscribe();
      console.log('✅ Unsubscribed from push notifications');
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    }
  }

  // Check if user is subscribed
  async isSubscribed(): Promise<boolean> {
    try {
      if (!this.registration) {
        await this.initialize();
        if (!this.registration) return false;
      }

      const subscription = await this.registration.pushManager.getSubscription();
      return subscription !== null;
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return false;
    }
  }

  // Get current permission status
  getPermission(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }
}

// Helper function to convert URL-safe Base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
