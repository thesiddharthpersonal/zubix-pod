# Quick Start Commands

## Initial Setup (One Time)

### Install Dependencies

#### Frontend
```bash
cd d:\pod\zubix-pod
bun install
bun add socket.io-client
```

#### Backend
```bash
cd d:\pod\zubix-pod-backend
npm install
```

### Database Setup (If not done)
```bash
cd d:\pod\zubix-pod-backend
npx prisma migrate dev
npx prisma generate
```

## Daily Development

### Start Backend Server
```bash
cd d:\pod\zubix-pod-backend
npm run dev
```
**Server will start on:** http://localhost:3000

### Start Frontend (New Terminal)
```bash
cd d:\pod\zubix-pod
bun run dev
```
**App will open at:** http://localhost:5173

## Testing

### Test Backend Health
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-06T...",
  "service": "zubix-pod-backend"
}
```

### Test Login Endpoint
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"emailOrMobile\":\"test@example.com\",\"password\":\"password123\"}"
```

## Useful Commands

### Backend

#### View Database
```bash
cd d:\pod\zubix-pod-backend
npx prisma studio
```

#### Reset Database
```bash
npx prisma migrate reset
```

#### Create New Migration
```bash
npx prisma migrate dev --name your_migration_name
```

### Frontend

#### Build for Production
```bash
cd d:\pod\zubix-pod
bun run build
```

#### Preview Production Build
```bash
bun run preview
```

#### Type Check
```bash
bun run type-check
```

#### Lint
```bash
bun run lint
```

## Troubleshooting Commands

### Clear Frontend Cache
```bash
cd d:\pod\zubix-pod
rm -rf node_modules bun.lockb
bun install
```

### Clear Backend Cache
```bash
cd d:\pod\zubix-pod-backend
rm -rf node_modules package-lock.json
npm install
```

### Restart Services
```bash
# Stop all Node processes
taskkill /F /IM node.exe

# Restart backend
cd d:\pod\zubix-pod-backend
npm run dev

# Restart frontend (new terminal)
cd d:\pod\zubix-pod
bun run dev
```

### Check Running Processes
```bash
# Check port 3000 (backend)
netstat -ano | findstr :3000

# Check port 5173 (frontend)
netstat -ano | findstr :5173
```

### Kill Process on Port
```bash
# Find PID
netstat -ano | findstr :3000

# Kill process (replace PID with actual process ID)
taskkill /F /PID <PID>
```

## Development Workflow

### 1. Morning Start
```bash
# Terminal 1: Backend
cd d:\pod\zubix-pod-backend
npm run dev

# Terminal 2: Frontend
cd d:\pod\zubix-pod
bun run dev
```

### 2. Working with Database
```bash
# Make changes to schema.prisma
cd d:\pod\zubix-pod-backend
npx prisma migrate dev --name describe_your_changes
npx prisma generate
# Restart backend server
```

### 3. Adding New API Endpoint
1. Add route in `src/routes/`
2. Update schema if needed
3. Test with curl or Postman
4. Add corresponding service in frontend `src/services/api/`
5. Use in components

### 4. Testing Real-time Features
```bash
# Open multiple browser tabs
# Login with different users
# Test chat/messaging features
```

## Environment Management

### Development (Current)
```bash
# Frontend: .env.local
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000

# Backend: .env
DATABASE_URL="postgresql://..."
JWT_SECRET=zubixpodsecret123
CLIENT_URL=http://localhost:5173
```

### Production (Future)
```bash
# Update URLs to production domains
VITE_API_BASE_URL=https://api.yourserver.com
VITE_WS_URL=wss://api.yourserver.com
```

## Common Issues & Fixes

### "Cannot connect to backend"
```bash
# Ensure backend is running
cd d:\pod\zubix-pod-backend
npm run dev
```

### "Database connection failed"
```bash
# Check PostgreSQL is running
# Verify DATABASE_URL in .env
cd d:\pod\zubix-pod-backend
npx prisma migrate reset
```

### "Token expired" errors
```javascript
// In browser console
localStorage.clear()
// Then login again
```

### "CORS errors"
```bash
# Verify CLIENT_URL in backend .env
# Should match frontend URL (http://localhost:5173)
```

### "WebSocket connection failed"
```bash
# Ensure backend Socket.IO is running
# Check browser console for token
# Try clearing localStorage and login again
```

## Package Management

### Update Dependencies

#### Frontend
```bash
cd d:\pod\zubix-pod
bun update
```

#### Backend
```bash
cd d:\pod\zubix-pod-backend
npm update
```

### Add New Package

#### Frontend
```bash
cd d:\pod\zubix-pod
bun add package-name
# or for dev dependency
bun add -d package-name
```

#### Backend
```bash
cd d:\pod\zubix-pod-backend
npm install package-name
# or for dev dependency
npm install -D package-name
```

## Git Workflow

### Initial Commit
```bash
cd d:\pod\zubix-pod
git add .
git commit -m "feat: integrate backend APIs and WebSocket"
git push
```

### Daily Commits
```bash
git add .
git commit -m "feat: add [feature name]"
git push
```

## Monitoring

### Watch Backend Logs
```bash
cd d:\pod\zubix-pod-backend
npm run dev
# Watch console output for requests
```

### Watch Frontend Logs
```bash
# Open browser DevTools Console
# Monitor API calls in Network tab
# Check Application > Local Storage for token
```

## Quick Reference

| Action | Command |
|--------|---------|
| Start Backend | `cd d:\pod\zubix-pod-backend && npm run dev` |
| Start Frontend | `cd d:\pod\zubix-pod && bun run dev` |
| Open Database | `cd d:\pod\zubix-pod-backend && npx prisma studio` |
| View Backend Logs | Check terminal running backend |
| View Frontend Errors | Open browser console (F12) |
| Clear Auth | `localStorage.clear()` in browser console |
| Reset Database | `cd d:\pod\zubix-pod-backend && npx prisma migrate reset` |

---

**Pro Tip**: Keep 2 terminals open - one for backend, one for frontend!
