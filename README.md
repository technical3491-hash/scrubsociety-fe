# ScrubSociety AI - GUI (Frontend)

Next.js 15 frontend application for ScrubSociety AI healthcare platform.

## Project Structure

```
gui/
├── src/
│   ├── app/              # Next.js App Router (routes)
│   ├── components/       # Reusable UI components
│   ├── features/         # Feature-based modules
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities & helpers
│   ├── context/          # React contexts
│   ├── store/            # State management
│   ├── styles/           # Global styles
│   ├── types/            # TypeScript definitions
│   └── config/           # Configuration files
├── public/               # Static assets
└── ...config files
```

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed structure.

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create `.env.local` (copy from `.env.example`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

**Getting an OpenAI API Key:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your OpenAI account
3. Click "Create new secret key"
4. Copy the key and paste it in `.env.local` as `NEXT_PUBLIC_OPENAI_API_KEY`

**Note:** The AI features will work with fallback suggestions even without an API key, but for best results, add your OpenAI API key.

3. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment on Vercel

This project is optimized for Vercel deployment.

### Quick Deploy

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Vercel](https://vercel.com) and import your repository
3. Vercel will auto-detect Next.js framework
4. Set environment variables:
   - `NEXT_PUBLIC_API_URL` - Your API server URL
5. Click Deploy!

### Environment Variables

Set these in Vercel project settings:
- `NEXT_PUBLIC_API_URL` - API server URL (e.g., `https://api.example.com`)
- `NEXT_PUBLIC_OPENAI_API_KEY` - OpenAI API key for AI features (get from [OpenAI Platform](https://platform.openai.com/api-keys))

## Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run check` - TypeScript type checking

## Path Aliases

The project uses TypeScript path aliases:
- `@/components/*` - UI components
- `@/lib/*` - Utilities
- `@/hooks/*` - Custom hooks
- `@/styles/*` - Styles
- `@/types/*` - TypeScript types
- `@/config/*` - Configuration

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
