# 🚀 Deployment Guide - Speak AI

## Render Deployment

### Build Configuration
- **Build Command:** `npm ci && node script/build.cjs`
- **Start Command:** `npm start`
- **Node.js Version:** 22.16.0

### Key Dependencies (Production)
```
✅ esbuild - Build server bundle
✅ vite - Build client bundle
✅ bcrypt - Password hashing
✅ jsonwebtoken - JWT auth
✅ pg - PostgreSQL driver
✅ express - Web framework
```

### Environment Variables Required
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NODE_ENV=production
```

### Database Setup
The app uses PostgreSQL via `DATABASE_URL` (Neon serverless)
- Automatic connection pooling
- SSL support enabled
- Connection file: `server/db.ts`

### Authentication
- Password hashing with bcrypt (min 6 chars)
- JWT tokens (7-day expiration)
- Email-based login/registration
- Kiwify payment integration for credits

### Build Process
1. Client build with Vite
2. Server bundle with esbuild
3. All dependencies resolved
4. Output: `dist/index.cjs`

### Last Updated
November 29, 2025
