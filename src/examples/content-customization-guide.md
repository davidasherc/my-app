# Content & Design Customization Guide

## 🎯 Quick Copy Editing Locations

### 1. App-Wide Text in App.tsx

```tsx
// Loading screen message (line ~135)
<p className="text-gray-600">Preparing your wellness journey...</p>

// Trial encouragement banner (lines ~180-190)
<p className="font-medium text-sm">
  Amazing! You've been journaling for {daysSinceCreation} days! 🎉
</p>
<p className="text-xs opacity-90">
  Ready to unlock deeper insights and keep your entire wellness history?
</p>

// Navigation labels (lines ~205-225)
<span className="hidden sm:inline">Journal</span>
<span className="hidden sm:inline">Insights</span>
<span className="hidden sm:inline">Upgrade</span>

// Profile page headings (lines ~260-265)
<h2>Your Wellness Profile</h2>
<p className="text-muted-foreground">Manage your account and track your progress</p>

// Footer copy (lines ~325-330)
<p>© 2024 Your Wellness Company. All rights reserved.</p>
<p>HIPAA-compliant emotional wellness tracking</p>
```

### 2. Button Text Throughout the App

```tsx
// Sign out button
<LogOut className="h-4 w-4 mr-2" />
Sign Out

// Upgrade buttons
Upgrade Now
Unlock Complete History
Get Premium Access

// Navigation
Journal → "My Emotions"
Insights → "Analytics" 
Upgrade → "Go Premium"
```

## 🎨 Design Element Customization

### 1. Colors (Edit in globals.css)

```css
:root {
  /* Main brand colors - EDIT THESE */
  --primary: #2563eb;     /* Blue - your main brand color */
  --secondary: #10b981;   /* Green - accent color */
  --accent: #f3e8ff;      /* Light purple - subtle backgrounds */
  
  /* Background gradients */
  --background-gradient: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  
  /* Emotion-specific colors */
  --emotion-happiness: #fbbf24;  /* Yellow */
  --emotion-anxiety: #f97316;    /* Orange */
  --emotion-calm: #10b981;       /* Green */
}

/* Custom brand themes */
.theme-healthcare {
  --primary: #2563eb;
  --secondary: #0d9488;
  --accent: #f0f9ff;
}

.theme-wellness {
  --primary: #059669;
  --secondary: #7c2d12;
  --accent: #f0fdf4;
}
```

### 2. Typography (Add to globals.css)

```css
/* Custom fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

:root {
  --font-family-brand: 'Inter', system-ui, sans-serif;
  --font-size-hero: 2.5rem;
  --font-size-heading: 1.875rem;
  --font-size-body: 1rem;
}

/* Apply custom typography */
.brand-typography {
  font-family: var(--font-family-brand);
}

.hero-text {
  font-size: var(--font-size-hero);
  font-weight: 600;
  line-height: 1.2;
}
```

### 3. Spacing and Layout

```css
/* Custom spacing scale */
:root {
  --spacing-xs: 0.25rem;    /* 4px */
  --spacing-sm: 0.5rem;     /* 8px */
  --spacing-md: 1rem;       /* 16px */
  --spacing-lg: 1.5rem;     /* 24px */
  --spacing-xl: 3rem;       /* 48px */
}

/* Page layouts */
.container-narrow {
  max-width: 42rem;  /* 672px */
  margin: 0 auto;
}

.container-wide {
  max-width: 80rem;  /* 1280px */
  margin: 0 auto;
}
```

## 📝 Component-Specific Copy Editing

### 1. Authentication Screen (`/components/AuthScreen.tsx`)

Look for these lines to edit:
```tsx
// Welcome messages
<CardTitle className="text-lg">Welcome back</CardTitle>
<CardDescription>Sign in to access your emotional wellness journal</CardDescription>

<CardTitle className="text-lg">Create your account</CardTitle>
<CardDescription>Start your emotional wellness journey with secure, private tracking</CardDescription>

// Form labels
<Label htmlFor="login-email">Email</Label>
<Label htmlFor="login-password">Password</Label>
<Label htmlFor="firstName">First Name</Label>

// Button text
Sign In → "Log In"
Create Account → "Get Started"
```

### 2. Journal Entry Component (`/components/JournalEntry.tsx`)

Look for:
```tsx
// Page headings
"How are you feeling today?"
"Track your emotional wellness"

// Emotion labels
"Happiness" → "Joy"
"Anxiety" → "Stress Level"
"Overall Mood" → "General Wellbeing"

// Instructions
"Move the sliders to reflect how you're feeling right now"
"Take a moment to check in with yourself"
```

### 3. Subscription Manager (`/components/SubscriptionManager.tsx`)

Look for:
```tsx
// Plan names
"Free Plan" → "Starter"
"Premium Plan" → "Professional"

// Feature descriptions
"Basic emotion tracking" → "Essential wellness tools"
"Advanced insights" → "Deep emotional analytics"

// Call-to-action buttons
"Upgrade Now" → "Start Premium Trial"
"Choose Plan" → "Get Started"
```

## 🎨 Visual Design Customization

### 1. Background Gradients

```tsx
// In App.tsx, change the main background:
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

// To custom colors:
<div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
<div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
<div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
```

### 2. Card Styling

```tsx
// Premium upgrade cards
<Card className="border-blue-200 bg-blue-50">
// Change to:
<Card className="border-purple-200 bg-purple-50">
<Card className="border-green-200 bg-green-50">
```

### 3. Icons and Visual Elements

```tsx
// Replace icons throughout the app
import { Heart, Crown, BarChart3 } from 'lucide-react';

// With your preferred icons:
import { Activity, Star, TrendingUp } from 'lucide-react';
```

## 🚀 Quick Customization Examples

### 1. Healthcare/Medical Theme

```tsx
// In App.tsx
<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">

// Colors in globals.css
:root {
  --primary: #1e40af;     /* Medical blue */
  --secondary: #059669;   /* Health green */
  --accent: #f1f5f9;      /* Clean gray */
}

// Copy changes
"Wellness Journal" → "Patient Health Tracker"
"Emotional wellness" → "Mental health monitoring"
"Insights" → "Clinical Overview"
```

### 2. Wellness/Spa Theme

```tsx
// Soft, organic colors
<div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">

:root {
  --primary: #059669;     /* Natural green */
  --secondary: #0891b2;   /* Calm teal */
  --accent: #f0fdf4;      /* Soft mint */
}

// Copy changes
"Journal" → "Mindfulness Log"
"Upgrade" → "Enhance Your Journey"
"Premium" → "Serenity Plus"
```

### 3. Tech/Modern Theme

```tsx
// Bold, contemporary design
<div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">

:root {
  --primary: #4f46e5;     /* Tech purple */
  --secondary: #06b6d4;   /* Cyan accent */
  --accent: #f8fafc;      /* Clean white */
}

// Copy changes
"Emotional wellness" → "Mood analytics"
"Journal" → "Data Logger"
"Insights" → "Metrics Dashboard"
```

## 📱 Mobile-Specific Customization

### 1. Mobile Text Sizing

```css
/* Responsive typography */
@media (max-width: 640px) {
  .hero-text {
    font-size: 1.875rem; /* Smaller on mobile */
  }
  
  .mobile-hidden-text {
    display: none;
  }
}
```

### 2. Mobile Navigation Labels

```tsx
// Shorter labels for mobile
<span className="hidden sm:inline">Journal</span> // Desktop
<span className="sm:hidden">Log</span>           // Mobile only
```

## 🎯 Branding System Integration

### 1. Using the BrandingProvider

```tsx
// Access your brand config anywhere
import { useBranding } from './components/BrandingProvider';

function MyComponent() {
  const { config } = useBranding();
  
  return (
    <div>
      <h1 style={{ color: config.primaryColor }}>
        Welcome to {config.appName}
      </h1>
      <p>{config.tagline}</p>
    </div>
  );
}
```

### 2. Dynamic Content Based on Brand

```tsx
// Conditional copy based on theme
const getCopyForTheme = (theme) => {
  const copyMap = {
    healthcare: {
      welcome: "Welcome to your health tracking platform",
      cta: "Start Monitoring"
    },
    wellness: {
      welcome: "Begin your wellness journey",
      cta: "Find Balance"
    },
    therapy: {
      welcome: "Your safe space for emotional growth",
      cta: "Start Healing"
    }
  };
  
  return copyMap[theme] || copyMap.healthcare;
};
```

## 🔧 Development Tips

1. **Search and Replace**: Use your editor's find/replace to quickly change recurring text
2. **Component Props**: Pass custom text as props to reusable components
3. **Config Files**: Create a content config file for easy bulk editing
4. **Translation Ready**: Structure your text for future internationalization

Your app is designed to be highly customizable - you can change any text, color, or design element to match your brand perfectly!