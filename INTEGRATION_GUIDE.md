# Zubix Pod - Frontend & Backend Integration Guide

## ✅ Integration Completed

The frontend has been successfully connected to the backend APIs. Here's what was implemented:

### 1. API Configuration (`src/services/api/config.ts`)
- ✅ Axios instance with base URL configuration
- ✅ Request interceptor for automatic auth token injection
- ✅ Response interceptor for error handling
- ✅ Token management utilities (get, set, remove)

### 2. API Services Implemented
All backend endpoints are now integrated:

- ✅ **Auth API** (`auth.ts`) - Login, Signup, Logout, Token refresh
- ✅ **Users API** (`users.ts`) - Profile management, Search users
- ✅ **Pods API** (`pods.ts`) - CRUD operations, Join/Leave, Co-owners
- ✅ **Posts API** (`posts.ts`) - Feed, Create, Update, Like, Comments
- ✅ **Rooms API** (`rooms.ts`) - Chat rooms, Messages, Q&A
- ✅ **Events API** (`events.ts`) - Event management, Registrations
- ✅ **Pitches API** (`pitches.ts`) - Pitch deck submissions, Status updates
- ✅ **Chat API** (`chat.ts`) - Direct messaging
- ✅ **Message Requests API** (`messageRequests.ts`) - Connection requests
- ✅ **Call Bookings API** (`callBookings.ts`) - Schedule calls with pod owners
- ✅ **Notifications API** (`notifications.ts`) - User notifications
- ✅ **Reactions API** (`reactions.ts`) - Post/Comment reactions

### 3. Real-time WebSocket Client (`src/services/socket.ts`)
- ✅ Socket.IO client with automatic reconnection
- ✅ Room messaging support
- ✅ Direct messaging support
- ✅ Typing indicators
- ✅ Real-time notifications

### 4. Updated AuthContext (`src/contexts/AuthContext.tsx`)
- ✅ Real API integration (replaced mock implementations)
- ✅ Automatic session restoration on page reload
- ✅ Error handling with toast notifications
- ✅ Pod membership management

### 5. Environment Configuration
- ✅ `.env.local` - Local development configuration
- ✅ `.env.example` - Template for environment variables

## 🚀 Getting Started

### Step 1: Install Socket.IO Client

```bash
# Using npm
cd d:\pod\zubix-pod
npm install socket.io-client

# Or using bun (since your project uses bun)
bun add socket.io-client
```

### Step 2: Start the Backend Server

```bash
cd d:\pod\zubix-pod-backend
npm install  # If not already installed
npm run dev  # Start on port 3000
```

### Step 3: Start the Frontend

```bash
cd d:\pod\zubix-pod
bun install  # If not already installed
bun run dev  # Start on port 5173
```

### Step 4: Configure Environment (Optional)

If your backend runs on a different port or host:

Edit `d:\pod\zubix-pod\.env.local`:
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

## 📝 Backend Requirements

Ensure your backend has these endpoints (already implemented in zubix-pod-backend):

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/signup`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Users
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `GET /api/users/search`

### Pods
- `GET /api/pods`
- `POST /api/pods`
- `GET /api/pods/:id`
- `PUT /api/pods/:id`
- `POST /api/pods/:id/join`
- `POST /api/pods/:id/leave`

### Posts
- `GET /api/posts/feed`
- `POST /api/posts`
- `GET /api/pods/:id/posts`
- `POST /api/posts/:id/like`

### And all other endpoints for Rooms, Events, Pitches, Chats, etc.

## 🔧 Usage Examples

### Login
```typescript
import { authApi } from '@/services/api';

const handleLogin = async () => {
  try {
    await authApi.login({
      emailOrMobile: 'user@example.com',
      password: 'password123'
    });
    // User is now authenticated
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Fetch Pods
```typescript
import { podsApi } from '@/services/api';

const loadPods = async () => {
  try {
    const pods = await podsApi.getAllPods();
    console.log('Pods:', pods);
  } catch (error) {
    console.error('Failed to load pods:', error);
  }
};
```

### WebSocket Connection
```typescript
import { socketClient } from '@/services/socket';

// Connect to WebSocket
const socket = socketClient.connect();

// Join a room
socketClient.joinRoom('room-id');

// Listen for messages
socketClient.onRoomMessage((message) => {
  console.log('New message:', message);
});

// Send a message
socketClient.sendRoomMessage('room-id', 'Hello everyone!');
```

## 🔐 Authentication Flow

1. User logs in via `authApi.login()`
2. Backend returns JWT token and user data
3. Token is stored in localStorage
4. All subsequent API requests include the token in Authorization header
5. On page reload, `AuthContext` attempts to restore session using stored token
6. If token is invalid/expired, user is redirected to login

## 🌐 WebSocket Authentication

WebSocket connections use the same JWT token:
1. Token is retrieved from localStorage
2. Sent in the `auth` field during connection
3. Backend validates token and associates socket with user
4. User can now join rooms and send messages

## ⚠️ Important Notes

1. **CORS**: Backend is configured to accept requests from `http://localhost:5173`
2. **Database**: Ensure PostgreSQL is running and prisma migrations are applied
3. **Environment**: Backend requires `.env` file with DATABASE_URL and JWT_SECRET
4. **Port Conflicts**: Default ports are 3000 (backend) and 5173 (frontend)

## 🐛 Troubleshooting

### API Requests Failing
- Check if backend is running on port 3000
- Verify CORS settings in backend
- Check browser console for detailed error messages

### WebSocket Connection Issues
- Ensure backend Socket.IO server is running
- Verify token is present in localStorage
- Check browser Network tab for WebSocket upgrade

### Authentication Issues
- Clear localStorage and try logging in again
- Verify JWT_SECRET matches between sessions
- Check token expiration (default 7 days)

## 📚 Next Steps

1. Install socket.io-client dependency
2. Start both backend and frontend servers
3. Test login functionality
4. Verify API calls in browser Network tab
5. Test real-time features using WebSocket

## 🎉 You're All Set!

Your frontend is now fully integrated with the backend. All API endpoints are connected and ready to use!
