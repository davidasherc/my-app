# Design Customization Examples

## 1. Easy Color Customization

### Option A: CSS Custom Properties (Recommended)
Edit `/styles/globals.css` and modify the `:root` variables:

```css
:root {
  /* Change primary brand color */
  --primary: #your-brand-color;
  --primary-foreground: #ffffff;
  
  /* Change accent colors */
  --secondary: #your-secondary-color;
  --accent: #your-accent-color;
  
  /* Custom emotion colors */
  --emotion-happiness: #your-happiness-color;
  --emotion-anxiety: #your-anxiety-color;
}
```

### Option B: Using the BrandingProvider (Dynamic)
```tsx
// In your app initialization
import { BrandingProvider } from './components/BrandingProvider';

const myBrandConfig = {
  appName: "MyTherapy App",
  primaryColor: "#6366f1", // Indigo
  secondaryColor: "#10b981", // Emerald
  theme: "therapy"
};

// Wrap your app
<BrandingProvider initialConfig={myBrandConfig}>
  <App />
</BrandingProvider>
```

## 2. Logo Customization

### Replace the Heart icon with your logo:
```tsx
// In any component
import { useBranding } from './components/BrandingProvider';

function MyHeader() {
  const { config } = useBranding();
  
  return (
    <div className="logo">
      {config.logo ? (
        <img src={config.logo} alt={config.appName} />
      ) : (
        <Heart /> // Fallback
      )}
    </div>
  );
}
```

## 3. Font Customization

### Add Google Fonts:
```html
<!-- In public/index.html -->
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
```

```css
/* In globals.css */
:root {
  --font-family-brand: 'Poppins', sans-serif;
}

body {
  font-family: var(--font-family-brand);
}
```

## 4. Component-Level Customization

### Custom Button Styles:
```tsx
// Create /components/ui/branded-button.tsx
import { Button } from './button';
import { useBranding } from '../BrandingProvider';

export function BrandedButton({ children, ...props }) {
  const { config } = useBranding();
  
  return (
    <Button 
      {...props}
      style={{
        backgroundColor: config.primaryColor,
        borderColor: config.primaryColor,
        ...props.style
      }}
    >
      {children}
    </Button>
  );
}
```

### Custom Emotion Slider Colors:
```tsx
// In JournalEntry.tsx
import { useBranding, getEmotionColor } from './BrandingProvider';

function EmotionSlider({ emotion }) {
  const { config } = useBranding();
  const emotionColor = getEmotionColor(emotion, config);
  
  return (
    <Slider
      className="emotion-slider"
      style={{
        '--slider-color': emotionColor
      }}
    />
  );
}
```

## 5. Layout Customization

### Custom Background Patterns:
```css
/* Add to globals.css */
.app-background {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  /* Or use patterns */
  background-image: url('/patterns/subtle-pattern.svg');
}
```

### Mobile-First Responsive Design:
```css
/* Customize mobile experience */
@media (max-width: 640px) {
  .mobile-optimized {
    /* Larger touch targets */
    min-height: 48px;
    min-width: 48px;
    
    /* Easier to read text */
    font-size: 16px;
    
    /* Better spacing */
    padding: 1rem;
  }
}
```

## 6. Animation Customization

### Smooth Transitions:
```css
/* Custom transition timing */
.brand-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover effects */
.interactive-element:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}
```

## 7. Dark Mode Support

### Auto Dark Mode:
```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #1a1a1a;
    --foreground: #ffffff;
    --primary: #your-dark-primary;
  }
}
```

## 8. Industry-Specific Themes

### Healthcare Theme:
```tsx
const healthcareTheme = {
  appName: "MediMind",
  primaryColor: "#2563eb", // Medical blue
  secondaryColor: "#059669", // Health green
  fontFamily: "professional",
  borderRadius: "soft"
};
```

### Wellness/Spa Theme:
```tsx
const wellnessTheme = {
  appName: "Serene",
  primaryColor: "#92400e", // Earth brown
  secondaryColor: "#065f46", // Forest green
  accentColor: "#fef3c7", // Warm cream
  fontFamily: "friendly",
  borderRadius: "organic"
};
```

### Tech/Startup Theme:
```tsx
const techTheme = {
  appName: "EmotiMetrics",
  primaryColor: "#1d4ed8", // Tech blue
  secondaryColor: "#7c2d12", // Innovation orange
  fontFamily: "modern",
  borderRadius: "sharp"
};
```

## 9. Advanced Customization

### Custom Emotion Icons:
```tsx
const customEmotionIcons = {
  happiness: YourHappyIcon,
  anxiety: YourAnxietyIcon,
  // ... other emotions
};
```

### Custom Charts and Analytics:
```tsx
// Use your brand colors in charts
const chartConfig = {
  colors: [
    config.emotionColors.happiness,
    config.emotionColors.anxiety,
    // ... etc
  ]
};
```

## 10. A/B Testing Different Themes

```tsx
// Test different themes with users
const themes = ['healthcare', 'therapy', 'wellness'];
const userTheme = themes[Math.floor(Math.random() * themes.length)];

// Apply theme based on user segment
applyTheme(userTheme);
```