# CryptSignal AI Chat Application

A ChatGPT-style frontend web application with comprehensive settings and in-memory storage, ready for integration with your own AI backend server.

## Features

- **Modern Chat Interface**: Clean, responsive chat UI with sidebar navigation
- **Comprehensive Settings**: Dark/light themes, font sizes (small/medium/large), and typing animations (instant/typewriter/natural)
- **CryptSignal Branding**: Fully branded interface with custom styling
- **In-Memory Storage**: No database dependencies - all data stored in memory during session
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices
- **TypeScript**: Full type safety throughout the application

## Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # UI components (sidebar, settings, etc.)
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/           # Utility functions and query client
│   │   └── App.tsx        # Main application component
├── server/                 # Express.js backend API
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route handlers
│   ├── storage.ts         # In-memory storage implementation
│   └── vite.ts           # Vite integration for development
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Data models and validation schemas
└── components.json        # shadcn/ui configuration
```

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   - Open http://localhost:5000 in your browser
   - The frontend and backend run on the same port

## Integration with Your AI Server

The application is designed to work with your own AI backend. Here's how to integrate:

### Option 1: Replace the AI Response Logic

Edit `server/routes.ts` and modify the message handling:

```typescript
// In the POST /api/conversations/:id/messages route
// Replace this placeholder logic:
const aiResponse = `Thanks for your message: "${content}"`;

// With your actual AI integration:
const aiResponse = await callYourAIService(content);
```

### Option 2: Proxy to Your AI Server

Modify the message endpoint to forward requests to your AI service:

```typescript
import fetch from 'node-fetch'; // You may need to install this

// In the message route handler
const response = await fetch('http://your-ai-server.com/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: content, conversationId: id })
});
const aiResponse = await response.text();
```

### Option 3: Replace the Entire Backend

You can also replace the entire Express server with your own backend while keeping the React frontend. The frontend expects these API endpoints:

- `GET /api/conversations` - Get all conversations
- `POST /api/conversations` - Create new conversation
- `DELETE /api/conversations/:id` - Delete conversation
- `GET /api/conversations/:id/messages` - Get messages for conversation
- `POST /api/conversations/:id/messages` - Send message and get AI response

## API Endpoints

### Conversations
- **GET** `/api/conversations` - Returns array of conversations
- **POST** `/api/conversations` - Creates new conversation
  ```json
  { "title": "New Chat" }
  ```
- **DELETE** `/api/conversations/:id` - Deletes conversation and messages

### Messages
- **GET** `/api/conversations/:id/messages` - Returns messages for conversation
- **POST** `/api/conversations/:id/messages` - Sends message and gets AI response
  ```json
  { "content": "Hello CryptSignal!" }
  ```

## Data Models

### Conversation
```typescript
{
  id: number;
  title: string;
  userId: number | null;
  createdAt: Date;
}
```

### Message
```typescript
{
  id: number;
  conversationId: number | null;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}
```

## Settings & Customization

The application includes a comprehensive settings system:

- **Appearance**: Light/dark theme toggle
- **Font Size**: Small, medium, large options
- **Typing Animation**: Instant, typewriter, or natural typing effects
- **About**: CryptSignal branding and information

Settings are automatically saved to browser localStorage and persist between sessions.

## Build for Production

```bash
npm run build
```

This creates:
- `dist/public/` - Built React frontend
- `dist/index.js` - Built Express server

Run in production:
```bash
npm run start
```

## Technologies Used

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query
- **Backend**: Express.js, TypeScript, Zod validation
- **Build**: Vite, ESBuild
- **UI Components**: Radix UI primitives with custom styling
- **Icons**: Lucide React

## Notes

- All data is stored in memory and will be lost when the server restarts
- The application is designed for easy integration with external AI services
- No database setup required - runs completely standalone
- Fully responsive and works on mobile devices
- TypeScript provides full type safety across frontend and backend

## Support

This application is ready to integrate with your AI backend. Modify the message handling in `server/routes.ts` to connect with your AI service, and you'll have a fully functional ChatGPT-style interface for your users.