# Logo Placement Guide

Your app now has a flexible logo system that allows you to place your brand anywhere! Here's how to customize and position logos throughout the application.

## Quick Setup

### 1. Add Your Logo to the Branding Configuration

```tsx
// Using the BrandingProvider
const myBrandConfig = {
  appName: "Your App Name",
  tagline: "Your tagline here",
  logo: "/path/to/your-logo.svg", // or .png, .jpg
  primaryColor: "#your-brand-color"
};

// Apply through BrandingCustomizer or directly
updateBrand(myBrandConfig);
```

### 2. Use Pre-built Logo Components

```tsx
import { 
  LogoComponent, 
  HeaderLogo, 
  LoadingLogo, 
  FooterLogo, 
  AuthPageLogo 
} from './components/LogoComponent';

// In your header
<HeaderLogo onClick={() => navigate('/')} />

// On loading screens
<LoadingLogo />

// In auth pages
<AuthPageLogo />
```

## Logo Placement Options

### Header Positions

```tsx
// Left-aligned header (current)
<header className="flex items-center justify-between">
  <LogoComponent size="sm" showText={true} layout="horizontal" />
  <UserMenu />
</header>

// Center-aligned header
<header className="flex items-center justify-center">
  <LogoComponent size="md" showText={true} layout="horizontal" />
</header>

// Right-aligned header
<header className="flex items-center justify-between">
  <Navigation />
  <LogoComponent size="sm" showText={true} layout="horizontal" />
</header>
```

### Full-Screen Branding

```tsx
// Splash screen with large logo
<div className="min-h-screen flex items-center justify-center">
  <LogoComponent 
    size="xl" 
    showText={true} 
    showTagline={true}
    layout="vertical"
    animate={true}
  />
</div>

// Hero section
<section className="py-20 text-center">
  <LogoComponent 
    size="lg" 
    showText={true} 
    showTagline={true}
    layout="vertical"
  />
  <p>Your amazing app description...</p>
</section>
```

### Fixed Positioning

```tsx
// Top-left corner (great for PWAs)
<LogoComponent 
  size="sm" 
  showText={false}
  className="logo-fixed-top-left"
/>

// Bottom-right corner
<LogoComponent 
  size="xs" 
  showText={false}
  className="logo-fixed-bottom-right opacity-60"
/>

// Centered overlay (for loading states)
<LogoComponent 
  size="lg" 
  showText={true}
  className="logo-center-screen"
  animate={true}
/>
```

### Background Watermarks

```tsx
// Subtle background branding
<div className="relative">
  <div className="logo-watermark logo-watermark-large">
    <LogoComponent 
      size="custom" 
      showText={true}
      customSize={{ 
        icon: "h-32 w-32", 
        text: "text-6xl" 
      }}
    />
  </div>
  <div className="relative z-10">
    {/* Your main content */}
  </div>
</div>
```

### Sidebar Logos

```tsx
// Collapsible sidebar
<aside className={`sidebar ${collapsed ? 'w-16' : 'w-64'}`}>
  <LogoComponent 
    size="sm"
    showText={!collapsed}
    layout={collapsed ? 'icon-only' : 'horizontal'}
    className="p-4"
  />
</aside>
```

## Custom Logo Sizes and Styles

### Custom Sizing

```tsx
<LogoComponent 
  size="custom"
  customSize={{
    icon: "h-20 w-20",
    text: "text-3xl",
    container: "h-24"
  }}
  showText={true}
/>
```

### Different Layouts

```tsx
// Horizontal (icon + text side by side)
<LogoComponent layout="horizontal" showText={true} />

// Vertical (icon above text)
<LogoComponent layout="vertical" showText={true} />

// Icon only
<LogoComponent layout="icon-only" />

// Text only (great for logotypes)
<LogoComponent layout="text-only" showText={true} />
```

### Animations and Effects

```tsx
// Animated logo for loading
<LogoComponent 
  animate={true}
  className="animate-logo-pulse logo-glow"
/>

// Hover effects
<LogoComponent 
  className="logo-hover-lift cursor-pointer"
  onClick={handleLogoClick}
/>

// Gradient text effect
<LogoComponent 
  showText={true}
  className="logo-text-gradient"
/>
```

## Industry-Specific Examples

### Healthcare/Medical Practice

```tsx
<LogoComponent 
  size="md"
  showText={true}
  showTagline={true}
  layout="horizontal"
  className="logo-container-healthcare p-4 rounded-lg"
/>
```

### Wellness/Spa

```tsx
<LogoComponent 
  size="lg"
  showText={true}
  layout="vertical"
  className="logo-container-wellness p-6 rounded-full"
/>
```

### Therapy Practice

```tsx
<LogoComponent 
  size="sm"
  showText={true}
  layout="horizontal"
  className="logo-container-therapy p-3 rounded-md"
/>
```

## Responsive Logo Behavior

```tsx
// Mobile-friendly responsive logo
<LogoComponent 
  size="sm"
  showText={true}
  layout="horizontal"
  className="logo-responsive-sm lg:logo-responsive-lg"
/>

// Hide text on small screens
<div className="flex items-center gap-2">
  <LogoComponent size="sm" showText={false} />
  <span className="hidden sm:block text-lg font-semibold">
    Your App Name
  </span>
</div>
```

## Logo in Different App States

### Authentication Pages

```tsx
// Large, welcoming logo
<div className="text-center mb-8">
  <AuthPageLogo />
</div>
```

### Error Pages

```tsx
<div className="min-h-screen flex flex-col items-center justify-center">
  <LogoComponent 
    size="lg" 
    showText={true}
    className="mb-8 opacity-60"
  />
  <h1>Oops! Something went wrong</h1>
</div>
```

### Empty States

```tsx
<div className="text-center py-12">
  <LogoComponent 
    size="md" 
    showText={false}
    className="mx-auto mb-4 opacity-40"
  />
  <p>No journal entries yet. Start your wellness journey!</p>
</div>
```

## Custom CSS for Advanced Positioning

```css
/* Floating logo in corner */
.logo-floating {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
  background: white;
  border-radius: 50%;
  padding: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Sticky header logo */
.logo-sticky {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

/* Parallax logo effect */
.logo-parallax {
  transform: translateY(calc(var(--scroll) * 0.5px));
}
```

## Logo File Recommendations

### File Formats
- **SVG**: Best for scalability and small file sizes
- **PNG**: Good for complex logos with transparency
- **WebP**: Modern format with excellent compression

### Sizing Guidelines
- **Favicon**: 32x32, 64x64, 128x128
- **Header**: 120x40 to 200x60 pixels
- **Loading**: 200x200 to 400x400 pixels
- **Mobile**: Ensure 44x44px minimum touch target

### File Organization
```
/public/logos/
  ├── logo.svg (main vector logo)
  ├── logo-white.svg (for dark backgrounds)
  ├── logo-icon.svg (icon only)
  ├── logo-horizontal.svg (wide format)
  └── logo-vertical.svg (stacked format)
```

## Implementation Tips

1. **Always provide fallbacks** - Use the Heart icon as default
2. **Test on different screen sizes** - Ensure logos are readable
3. **Consider loading performance** - Optimize image files
4. **Maintain brand consistency** - Use the same logo across all touchpoints
5. **Think about accessibility** - Provide alt text and sufficient contrast

The logo system is fully integrated with your branding configuration, so you can update everything from one place!