# Overview

This is a multi-module AI platform that provides four integrated creative tools: AI Chat, Prompt Generator, Image Generator, and Video Generator. The application is built as a full-stack web platform with a React frontend and Express backend, designed to be deployed on Replit or similar cloud platforms. Users interact with various Google Gemini AI models through a unified interface, with authentication, credit management, and webhook integration for payment processing via Kiwify.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack:**
- React 19 with TypeScript for the UI layer
- Vite as the build tool and development server
- Wouter for client-side routing
- TanStack Query for server state management
- Tailwind CSS with shadcn/ui components for styling
- Custom font combination: Outfit for headings, Inter for body text

**Design Decisions:**
- Single Page Application (SPA) architecture with client-side routing
- Component-based architecture with reusable UI components from shadcn/ui
- Path aliases (@/, @shared/, @assets/) for clean imports
- Responsive design with mobile-first approach
- Dark theme as default with slate color palette

**Key Modules:**
1. **Home** - Landing page with platform overview
2. **Chat** - AI conversation interface with chat history
3. **Prompt** - Creative prompt generation tool
4. **Image** - Image generation from text prompts
5. **Video** - Video generation with multiple modes (text-to-video, image-to-video, reference-to-video)
6. **Members** - Member area for course access
7. **Admin** - Administrative dashboard

## Backend Architecture

**Technology Stack:**
- Node.js with Express framework
- TypeScript for type safety
- Drizzle ORM for database interactions
- PostgreSQL (via Neon serverless) for production data storage
- In-memory storage fallback for development

**Authentication & Authorization:**
- JWT-based authentication with 7-day token expiration
- Auth middleware for protected routes
- Optional auth middleware for public endpoints
- Integration with Kiwify for user validation and product access

**Credit System:**
- User credit tracking (purchased, used, remaining)
- Credit deduction per operation type (chat, image, prompt, video)
- Transaction logging for audit trail
- Insufficient credits handling with proper error responses

**API Structure:**
- RESTful API endpoints under `/api` prefix
- Authentication routes: `/api/auth/login`, `/api/auth/validate-access`
- Service routes: `/api/chat/*`, `/api/prompt/*`, `/api/image/*`, `/api/video/*`
- Webhook endpoint: `/api/webhook/kiwify`

**Service Layer Pattern:**
- Separate service files for each AI capability
- Chat service: Manages conversation state and message handling
- Prompt service: Generates creative prompts using Gemini
- Image service: Handles image generation requests
- Video service: Manages video generation with multiple input modes
- Kiwify service: Handles user authentication and purchase validation
- Webhook service: Processes payment webhooks and credit allocation

## Data Storage

**Database Schema (PostgreSQL with Drizzle):**
- `users` table: User accounts with username, password, email, name, status
- `user_credits` table: Credit balances and totals (purchased, used)
- `credit_transactions` table: Audit log of all credit movements with types (purchase, usage, refund, admin)

**In-Memory Storage:**
- Development fallback using Map structures
- Session-based chat instance storage (Map<sessionId, Chat>)
- User and credit data stored in memory for dev environment

**Pros of Current Approach:**
- Drizzle provides type-safe database access
- Schema-first approach with automatic TypeScript types
- Easy migration management
- Neon serverless PostgreSQL for zero-management production database

**Cons:**
- In-memory storage loses data on restart in dev mode
- Need to ensure proper connection pooling for production
- Webhook replay protection not fully implemented

## External Dependencies

**Google Gemini AI Integration:**
- Primary AI provider for all generation tasks
- Models used:
  - `gemini-2.5-flash`: Chat, prompt generation, image generation
  - `gemini-2.5-flash-image`: Image generation
  - `veo-3.1-generate-preview`: Video generation
- API key stored in environment variable `GEMINI_API_KEY`
- Streaming responses for chat interface
- Multi-modal inputs (text, images, audio) support

**Kiwify Payment Integration:**
- Webhook-based integration for purchase notifications
- User authentication via email/product validation
- Credit allocation based on purchase value
- Signature verification for webhook security (KIWIFY_WEBHOOK_SECRET)
- Product-based access control for members area

**Third-Party Libraries:**
- @radix-ui: Accessible component primitives for UI
- axios: HTTP client for API requests
- jsonwebtoken: JWT token generation and verification
- multer: File upload handling (if needed for images/videos)
- express-rate-limit: API rate limiting protection
- connect-pg-simple: PostgreSQL session store
- Various development tools (ESLint, Prettier, TypeScript)

**Environment Configuration:**
- `DATABASE_URL`: PostgreSQL connection string (Neon)
- `GEMINI_API_KEY`: Google Gemini API access
- `JWT_SECRET`: Token signing key (production should use secure random)
- `KIWIFY_WEBHOOK_SECRET`: Webhook signature validation
- `NODE_ENV`: Environment flag (development/production)

**Deployment Considerations:**
- Vite plugin for meta image updates on Replit deployments
- Static file serving from dist/public directory
- Health check endpoints for deployment monitoring
- CORS configuration for cross-origin requests
- Rate limiting to prevent abuse
- Error handling with user-friendly messages in Portuguese