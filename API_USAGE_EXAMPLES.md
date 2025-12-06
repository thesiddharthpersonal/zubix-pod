# API Usage Examples for Components

This guide shows how to use the integrated backend APIs in your React components.

## Table of Contents
1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Pod Management](#pod-management)
4. [Posts & Feed](#posts--feed)
5. [Real-time Chat](#real-time-chat)
6. [Events](#events)
7. [Notifications](#notifications)

---

## Authentication

### Login Page
```typescript
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function Login() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirect to home or dashboard
    } catch (error) {
      // Error is already displayed via toast in AuthContext
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button disabled={isLoading}>Login</button>
    </form>
  );
}
```

### Signup Page
```typescript
import { useAuth } from '@/contexts/AuthContext';

export default function Signup() {
  const { signup, isLoading } = useAuth();

  const handleSubmit = async (data: SignupData) => {
    try {
      await signup(data);
      // Redirect to complete profile or home
    } catch (error) {
      console.error(error);
    }
  };

  // ... form implementation
}
```

---

## User Management

### Profile Page
```typescript
import { usersApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const data = await usersApi.getProfile(user!.id);
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const updateProfile = async (updates: UpdateProfileRequest) => {
    try {
      const updated = await usersApi.updateProfile(user!.id, updates);
      setProfile(updated);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  // ... component JSX
}
```

### Search Users
```typescript
import { usersApi } from '@/services/api';
import { useState } from 'react';

export default function UserSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (query.trim()) {
      try {
        const users = await usersApi.searchUsers(query);
        setResults(users);
      } catch (error) {
        console.error('Search failed:', error);
      }
    }
  };

  // ... component JSX
}
```

---

## Pod Management

### Pod Discovery
```typescript
import { podsApi } from '@/services/api';
import { useEffect, useState } from 'react';
import { Pod } from '@/types';

export default function PodDiscovery() {
  const [pods, setPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPods();
  }, []);

  const loadPods = async () => {
    try {
      const data = await podsApi.getAllPods();
      setPods(data);
    } catch (error) {
      console.error('Failed to load pods:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByCategory = async (subcategory: PodSubcategory) => {
    try {
      const filtered = await podsApi.getPodsBySubcategory(subcategory);
      setPods(filtered);
    } catch (error) {
      console.error('Failed to filter:', error);
    }
  };

  // ... component JSX
}
```

### Create Pod
```typescript
import { podsApi } from '@/services/api';

export default function CreatePod() {
  const handleCreatePod = async (data: CreatePodRequest) => {
    try {
      const newPod = await podsApi.createPod(data);
      toast.success('Pod created successfully!');
      // Redirect to pod page
    } catch (error) {
      toast.error('Failed to create pod');
    }
  };

  // ... form implementation
}
```

### Join/Leave Pod
```typescript
import { useAuth } from '@/contexts/AuthContext';

export default function PodCard({ pod }: { pod: Pod }) {
  const { user, joinPod, leavePod, joinedPods } = useAuth();
  
  const isMember = joinedPods.some(p => p.id === pod.id);

  const handleToggleMembership = async () => {
    if (isMember) {
      await leavePod(pod.id);
    } else {
      await joinPod(pod);
    }
  };

  return (
    <div>
      <h3>{pod.name}</h3>
      <button onClick={handleToggleMembership}>
        {isMember ? 'Leave' : 'Join'}
      </button>
    </div>
  );
}
```

---

## Posts & Feed

### Home Feed
```typescript
import { postsApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function Home() {
  const { joinedPods } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState<'all' | 'owner' | 'members'>('all');

  useEffect(() => {
    loadFeed();
  }, [joinedPods, filter]);

  const loadFeed = async () => {
    const podIds = joinedPods.map(p => p.id);
    if (podIds.length > 0) {
      try {
        const feed = await postsApi.getFeedPosts(podIds, filter);
        setPosts(feed);
      } catch (error) {
        console.error('Failed to load feed:', error);
      }
    }
  };

  // ... component JSX
}
```

### Create Post
```typescript
import { postsApi } from '@/services/api';

export default function CreatePost({ podId }: { podId: string }) {
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    try {
      const post = await postsApi.createPost({
        podId,
        content,
        mediaUrls: [],
      });
      toast.success('Post created!');
      setContent('');
      // Refresh feed
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  // ... component JSX
}
```

### Like Post & Comments
```typescript
import { postsApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likes.includes(user?.id || ''));

  const handleLike = async () => {
    try {
      if (liked) {
        await postsApi.unlikePost(post.id, user!.id);
      } else {
        await postsApi.likePost(post.id, user!.id);
      }
      setLiked(!liked);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleComment = async (content: string) => {
    try {
      await postsApi.addComment({ postId: post.id, content });
      // Refresh comments
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  // ... component JSX
}
```

---

## Real-time Chat

### Room Chat
```typescript
import { socketClient } from '@/services/socket';
import { roomsApi } from '@/services/api';
import { useEffect, useState } from 'react';

export default function RoomChat({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Connect WebSocket
    socketClient.connect();
    
    // Join room
    socketClient.joinRoom(roomId);

    // Listen for new messages
    const handleNewMessage = (message: any) => {
      setMessages(prev => [...prev, message]);
    };
    socketClient.onRoomMessage(handleNewMessage);

    // Load existing messages
    loadMessages();

    return () => {
      socketClient.leaveRoom(roomId);
      socketClient.offRoomMessage(handleNewMessage);
    };
  }, [roomId]);

  const loadMessages = async () => {
    try {
      const msgs = await roomsApi.getRoomMessages(roomId);
      setMessages(msgs);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      socketClient.sendRoomMessage(roomId, newMessage);
      setNewMessage('');
    }
  };

  // ... component JSX
}
```

### Direct Messages
```typescript
import { socketClient } from '@/services/socket';
import { chatApi } from '@/services/api';
import { useEffect, useState } from 'react';

export default function DirectChat({ chatId }: { chatId: string }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socketClient.connect();
    socketClient.joinChat(chatId);

    const handleNewDM = (message: any) => {
      setMessages(prev => [...prev, message]);
    };
    socketClient.onDirectMessage(handleNewDM);

    loadMessages();

    return () => {
      socketClient.offDirectMessage(handleNewDM);
    };
  }, [chatId]);

  const loadMessages = async () => {
    try {
      const msgs = await chatApi.getChatMessages(chatId);
      setMessages(msgs);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = (content: string) => {
    socketClient.sendDirectMessage(chatId, content);
  };

  // ... component JSX
}
```

---

## Events

### Event List
```typescript
import { eventsApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function Events() {
  const { joinedPods } = useAuth();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadEvents();
  }, [joinedPods]);

  const loadEvents = async () => {
    const podIds = joinedPods.map(p => p.id);
    try {
      const upcoming = await eventsApi.getUpcomingEvents(podIds);
      setEvents(upcoming);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const registerForEvent = async (eventId: string) => {
    try {
      await eventsApi.registerForEvent(eventId, user!.id);
      toast.success('Registered for event!');
    } catch (error) {
      toast.error('Registration failed');
    }
  };

  // ... component JSX
}
```

---

## Notifications

### Notification Bell
```typescript
import { notificationsApi } from '@/services/api';
import { socketClient } from '@/services/socket';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function NotificationBell() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      loadNotifications();
      loadUnreadCount();

      // Real-time notifications
      socketClient.connect();
      socketClient.onNotification((notif) => {
        setNotifications(prev => [notif, ...prev]);
        setCount(prev => prev + 1);
      });
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const data = await notificationsApi.getUserNotifications(user!.id);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const unread = await notificationsApi.getUnreadCount(user!.id);
      setCount(unread);
    } catch (error) {
      console.error('Failed to load count:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // ... component JSX with badge showing count
}
```

---

## Tips & Best Practices

1. **Error Handling**: Always wrap API calls in try-catch blocks
2. **Loading States**: Use loading states to improve UX
3. **Toast Notifications**: Use `toast` from 'sonner' for user feedback
4. **WebSocket Cleanup**: Always cleanup WebSocket listeners in useEffect return
5. **Type Safety**: Import types from `@/types` for type-safe code
6. **Auth Context**: Use `useAuth()` hook to access user and authentication methods
7. **Token Management**: Token is automatically handled by axios interceptors

---

## Common Patterns

### API Call with Loading State
```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await api.someMethod();
    // Process data
  } catch (error) {
    toast.error('Operation failed');
  } finally {
    setLoading(false);
  }
};
```

### Protected Route
```typescript
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <div>Protected Content</div>;
}
```

---

For more details, check the main [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
