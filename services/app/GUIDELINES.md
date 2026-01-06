# BNA UI Development Guidelines

This document outlines the conventions and best practices for developing with BNA UI in this Expo application.

---

## Overview

BNA UI (Build Native Apps UI) is a component library designed for Expo React Native applications. It provides:

- Pre-built, customizable UI components
- Built-in light/dark mode support
- TypeScript-first approach
- Theme system with semantic color management
- Animation-ready components with React Native Reanimated

---

## Theme System

### Color Usage

Always use the `useColor` hook for theme-aware colors:

```typescript
import { useColor } from '@/hooks/useColor';

function MyComponent() {
  const textColor = useColor('text');
  const primaryColor = useColor('primary');

  // With custom overrides
  const customColor = useColor('text', {
    light: '#custom-light',
    dark: '#custom-dark'
  });
}
```

### Available Colors

| Color Name    | Purpose                          |
|---------------|----------------------------------|
| `background`  | Screen/page background           |
| `foreground`  | Default foreground content       |
| `card`        | Card backgrounds                 |
| `primary`     | Primary actions and emphasis     |
| `secondary`   | Secondary UI elements            |
| `destructive` | Destructive/danger actions       |
| `muted`       | Muted/subdued content            |
| `accent`      | Accent highlights                |
| `border`      | Borders and dividers             |
| `text`        | Primary text                     |
| `textMuted`   | Secondary/muted text             |

### iOS System Colors

For platform-consistent colors, use the iOS semantic colors:

```typescript
const blueColor = useColor('blue');    // #007AFF
const greenColor = useColor('green');  // #34C759
const redColor = useColor('red');      // #FF3B30
```

### Global Constants

Use constants from `@/theme/globals` for consistent sizing:

```typescript
import { HEIGHT, FONT_SIZE, BORDER_RADIUS, CORNERS } from '@/theme/globals';

// HEIGHT = 48        - Standard component height
// FONT_SIZE = 17     - Base typography size
// BORDER_RADIUS = 26 - Moderate border radius
// CORNERS = 999      - Fully rounded (pill-shaped)
```

---

## Component Patterns

### Component Conventions

1. **Use `forwardRef`** for components needing imperative access
2. **Export `displayName`** for React DevTools debugging
3. **Support light/dark overrides** via `lightColor`/`darkColor` props
4. **Use semantic colors** from the theme system
5. **Spread remaining props** for flexibility
6. **Merge styles** with array syntax: `style={[baseStyle, style]}`

---

## Core Components

### Button

```typescript
import { Button } from '@/components/ui/button';
import { Trash, Save } from 'lucide-react-native';

// Basic
<Button onPress={handlePress}>Submit</Button>

// With variant and size
<Button variant="destructive" size="lg">Delete</Button>

// With icon
<Button icon={Save}>Save Changes</Button>

// Loading state
<Button loading={isLoading}>Processing</Button>

// Icon-only
<Button variant="ghost" size="icon" icon={Trash} />
```

**Variants:** `default` | `destructive` | `success` | `outline` | `secondary` | `ghost` | `link`

**Sizes:** `default` | `sm` | `lg` | `icon`

### Text

```typescript
import { Text } from '@/components/ui/text';

<Text variant="heading">Page Title</Text>
<Text variant="title">Section Title</Text>
<Text variant="body">Body content</Text>
<Text variant="caption">Small caption</Text>
<Text variant="link">Clickable link</Text>
```

**Variants:** `body` | `title` | `subtitle` | `caption` | `heading` | `link`

### Input

```typescript
import { Input, GroupedInput, GroupedInputItem } from '@/components/ui/input';
import { Mail, Lock } from 'lucide-react-native';

// Basic
<Input placeholder="Enter text" value={value} onChangeText={setValue} />

// With label and icon
<Input label="Email" icon={Mail} placeholder="you@example.com" />

// With error
<Input label="Password" error="Password is required" />

// Textarea mode
<Input textarea numberOfLines={4} placeholder="Description" />

// Grouped inputs
<GroupedInput>
  <GroupedInputItem icon={Mail} placeholder="Email" />
  <GroupedInputItem icon={Lock} placeholder="Password" secureTextEntry />
</GroupedInput>
```

**Variants:** `filled` | `outline`

### Card

```typescript
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Text>Card content goes here</Text>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Spinner

```typescript
import { Spinner, LoadingOverlay, ButtonSpinner } from '@/components/ui/spinner';

// Basic spinner
<Spinner />

// With variant
<Spinner variant="dots" size={24} />

// Full-screen loading
<LoadingOverlay visible={isLoading} message="Loading..." />
```

**Variants:** `default` | `circle` | `dots` | `pulse` | `bars`

### Tabs

```typescript
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    <Text>Content for tab 1</Text>
  </TabsContent>
  <TabsContent value="tab2">
    <Text>Content for tab 2</Text>
  </TabsContent>
</Tabs>

// Swipeable carousel mode
<Tabs defaultValue="tab1" mode="carousel">
  {/* ... */}
</Tabs>
```

### Gallery

```typescript
import { Gallery } from '@/components/ui/gallery';

const images = [
  { uri: 'https://example.com/image1.jpg', title: 'Image 1' },
  { uri: 'https://example.com/image2.jpg', title: 'Image 2' },
];

<Gallery images={images} columns={2} showThumbnails />
```

---

## Hooks

### useColor

Theme-aware color retrieval:

```typescript
import { useColor } from '@/hooks/useColor';

const color = useColor('primary');
const colorWithOverride = useColor('text', { light: '#000', dark: '#fff' });
```

### useColorScheme

Get current color scheme:

```typescript
import { useColorScheme } from '@/hooks/useColorScheme';

const colorScheme = useColorScheme(); // 'light' | 'dark'
```

---

## File Organization

```
components/
├── ui/                    # BNA UI components
│   ├── button.tsx
│   ├── text.tsx
│   ├── input.tsx
│   └── ...
├── [feature]/             # Feature-specific components
│   ├── FeatureCard.tsx
│   └── index.ts
hooks/
├── useColor.ts            # Theme color hook
├── useColorScheme.ts      # Color scheme detection
└── use[Feature].ts        # Feature-specific hooks
theme/
├── colors.ts              # Color definitions
├── globals.ts             # Global constants
└── theme-provider.tsx     # Theme context provider
```

---

## Best Practices

### Do

- Use semantic color names from the theme
- Use the `useColor` hook for all colors
- Use global constants for consistent sizing
- Support both light and dark modes
- Use TypeScript for all components
- Export `displayName` for debugging
- Use `forwardRef` when ref access is needed

### Don't

- Hardcode color values (use theme colors)
- Use inline magic numbers (use constants)
- Create components without TypeScript types
- Ignore dark mode support
- Use raw React Native components when BNA UI equivalents exist
- Skip the loading state for async actions

---

## Accessibility

- Ensure sufficient color contrast (WCAG AA minimum)
- Use appropriate touch target sizes (minimum 44x44)
- Provide meaningful labels for interactive elements
- Support disabled states with visual feedback
- Test with VoiceOver (iOS) and TalkBack (Android)

---

## Platform Considerations

### iOS-Specific

- Use `expo-haptics` for haptic feedback on buttons
- Leverage iOS system colors for native feel
- Use `expo-glass-effect` for blur effects where appropriate

### Android-Specific

- Handle navigation bar color with `expo-navigation-bar`
- Test Material Design ripple effects
- Verify gesture handling on various devices

---

## Resources

- [BNA UI Documentation](https://bna-ui.com)
- [Expo Documentation](https://docs.expo.dev)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated)
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler)
