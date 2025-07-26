# CryptSignal AI Chat Application

## Overview
This is a full-stack web application that provides an AI-powered chat interface with CryptSignal branding. The application features a modern, responsive design built with React and TypeScript for the frontend, Express.js for the backend API, and PostgreSQL with Drizzle ORM for data persistence. It includes conversation management, message history, comprehensive settings panel, and a clean, intuitive user interface with dark/light theme support and customizable typing animations.

## User Preferences
Preferred communication style: Simple, everyday language.
AI Assistant Name: CryptSignal

## Recent Changes
✓ Removed database features for local development compatibility (2025-01-22)
✓ Replaced persistent database storage with in-memory storage
✓ Removed database dependencies and configuration files
✓ Created comprehensive README with integration instructions
✓ Implemented comprehensive settings system (2025-01-22)
✓ Created CryptSignal branding throughout application
✓ Built typing animation system with three styles (instant, typewriter, natural)
✓ Added font size customization (small, medium, large)
✓ Enhanced settings dialog with appearance, behavior, and about sections
✓ Updated all components to use centralized settings provider

## System Architecture
The application follows a monorepo structure with clear separation between client (frontend), server (backend), and shared code. It uses modern web development practices with TypeScript throughout the stack, providing type safety and better developer experience.

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Library**: Radix UI components with shadcn/ui for consistent, accessible design
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite with React plugin and hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful API structure with proper error handling
- **Request Logging**: Custom middleware for API request logging and monitoring
- **Development**: Vite integration for seamless full-stack development

## Key Components

### Data Models
The application uses three main entities defined in the shared schema:
- **Users**: Authentication and user management (username/password)
- **Conversations**: Chat conversation containers with titles and timestamps
- **Messages**: Individual messages within conversations (user/assistant roles)

### Storage Layer
- **Interface**: Abstracted storage interface (`IStorage`) for flexibility and testability
- **Implementation**: In-memory storage (`MemStorage`) for local development
- **Data Persistence**: Session-based storage (data resets on server restart)
- **Integration Ready**: Easy to replace with database or external API calls

### Chat Interface Components
- **Sidebar**: Conversation list with create/delete functionality, theme toggle, and settings access
- **Mobile Sidebar**: Responsive drawer for mobile devices with settings integration
- **Message List**: Scrollable message history with copy functionality, auto-scroll, and typing animations
- **Message Input**: Text area with send functionality and conversation management
- **Settings Dialog**: Comprehensive settings panel with appearance, behavior, and about sections
- **Settings Provider**: Centralized settings management with localStorage persistence
- **Typing Message**: Animated message display supporting instant, typewriter, and natural typing styles

## Data Flow

### Conversation Management
1. Users can create new conversations through the sidebar
2. Conversations are listed chronologically with timestamps
3. Users can select conversations to view message history
4. Conversations can be deleted with confirmation

### Message Flow
1. User types message in the input area
2. Message is sent via POST to `/api/conversations/:id/messages`
3. Backend processes message and generates AI response (placeholder for now)
4. Both user and AI messages are stored and returned
5. Frontend updates the message list with real-time display

### API Endpoints
- `GET /api/conversations` - Retrieve all conversations
- `POST /api/conversations` - Create new conversation
- `DELETE /api/conversations/:id` - Delete conversation
- `GET /api/conversations/:id/messages` - Get messages for conversation
- `POST /api/conversations/:id/messages` - Send message and get AI response

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless connection for production
- **drizzle-orm**: Type-safe ORM with PostgreSQL support
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React router
- **date-fns**: Date formatting and manipulation

### UI Dependencies
- **@radix-ui/***: Accessible, unstyled UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Modern icon library
- **class-variance-authority**: Type-safe variant API for components

### Development Dependencies
- **vite**: Fast build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for Node.js

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React application to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Assets**: Static files served from built frontend directory

### Environment Configuration
- **Development**: Uses tsx for TypeScript execution with hot reload
- **Production**: Compiled JavaScript with optimized builds
- **Database**: Configured for PostgreSQL with environment-based connection string

### Scripts
- `npm run dev`: Development server with hot reload
- `npm run build`: Production build for both frontend and backend  
- `npm run start`: Production server startup
- `npm run db:push`: Database schema deployment via Drizzle

The application is designed to be easily deployable to platforms like Railway, Vercel, or similar services that support full-stack applications with PostgreSQL databases.