# Avatarmon

A React Native (Expo) app that generates AI-powered avatars using Replicate's image generation models.

## Prerequisites

- Node.js 18+
- npm or yarn
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator (Mac) or Android Emulator, or Expo Go app on your device
- Replicate API token (for image generation)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
# Development
EXPO_PUBLIC_API_URL=http://localhost:8082

# Production (default if not set)
# EXPO_PUBLIC_API_URL=https://api.avatarmon.com

REPLICATE_API_TOKEN=your_replicate_api_token_here
```

Get your Replicate API token from [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens).

### 3. Start the development server

```bash
npx expo start
```

Then press:
- `i` to open iOS Simulator
- `a` to open Android Emulator
- Scan QR code with Expo Go app on your device

## Available Scripts

```bash
# Start development server
npx expo start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type check
npm run typecheck

# Lint
npm run lint

# Format code
npm run format
```

## Project Structure

```
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home screen
│   │   ├── create.tsx     # Avatar creation
│   │   ├── history.tsx    # Generation history
│   │   └── settings.tsx   # Settings & premium
│   ├── api/               # API routes (Replicate)
│   └── preview.tsx        # Avatar preview modal
├── components/
│   ├── avatar/            # Avatar-specific components
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and API client
├── schemas/               # Zod validation schemas
├── store/                 # Zustand state management
├── theme/                 # Design tokens and colors
└── __tests__/             # Test files
```

## Features

- **Photo Upload**: Transform selfies into stylized avatars
- **Character Builder**: Create avatars from scratch with customizable attributes
- **8 Art Styles**: Anime, Pixar, 3D Render, Pixel Art, Watercolor, Comic, Cyberpunk, Fantasy
- **Multiple Aspect Ratios**: 1:1, 3:4, 4:3, 9:16
- **Export Options**: Save to gallery or share
- **Generation History**: View and manage past creations
- **Premium Tier**: Unlimited generations (free tier: 5/day)

## Tech Stack

- React Native + Expo SDK 54
- TypeScript (strict mode)
- Expo Router (file-based navigation)
- Zustand (state management)
- Zod (validation)
- Replicate (AI image generation)
- Jest (testing)

## Testing

Run the test suite:

```bash
npm test
```

Current coverage: 370 tests across schemas, hooks, store, and integration tests.

## License

MIT
