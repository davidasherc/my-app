# Complete Logo Setup Guide - Three Logo Variants

Your app now supports **three different logo versions** for different contexts. This is professional branding best practice!

---

## 🎯 Logo Types You Need

### 1. **Header/Footer Logo** (Horizontal)
- **Used in:** Top navigation bar, footer
- **Best format:** Horizontal logo with your brand name
- **Recommended size:** 300x80px (or similar wide aspect ratio)
- **File name:** `logo-header.png`

### 2. **Loading/Login Logo** (Feature)
- **Used in:** Loading screens, login/signup pages, auth screens
- **Best format:** Square or vertical, your main brand logo
- **Recommended size:** 512x512px or 400x600px
- **File name:** `logo-feature.png`

### 3. **App Icon** (Square Icon)
- **Used in:** App stores (iOS/Android), PWA install, device home screen
- **Best format:** Simple square icon (no text works best)
- **Required size:** 512x512px (will auto-scale to 192x192px)
- **File name:** `icon-512.png`

---

## 🚀 Quick Setup (Recommended for Production)

### Step 1: Prepare Your Logo Files

Create three PNG files:
```
logo-header.png    ← Horizontal logo with text
logo-feature.png   ← Your main brand logo
icon-512.png       ← Simple square icon
```

### Step 2: Place Files in `/public` Folder

```
/public
  ├── logo-header.png    (300x80px or similar)
  ├── logo-feature.png   (512x512px recommended)
  ├── icon-512.png       (512x512px required)
  └── icon-192.png       (192x192px - optional, auto-generated)
```

### Step 3: Configure in App

**Option A: Use the Branding Customizer (Easiest)**

1. Launch your app and sign in
2. Click **"Customize"** tab → **"Identity"** section
3. Enter these values:
   - Header/Footer Logo: `/logo-header.png`
   - Loading/Login Logo: `/logo-feature.png`
   - App Icon: `/icon-512.png`
4. See instant previews!

**Option B: Edit the Code Directly**

Open `/components/BrandingProvider.tsx` and update (around line 40):

```tsx
const defaultBrandConfig: BrandConfig = {
  appName: 'Emotion Journal',
  tagline: 'HIPAA-compliant emotional wellness tracking',
  logoHeader: '/logo-header.png',    // ← Add this
  logoFeature: '/logo-feature.png',  // ← Add this
  logoIcon: '/icon-512.png',         // ← Add this
  theme: 'healthcare',
  // ... rest of config
};
```

---

## 📐 Logo Specifications

### Header/Footer Logo
```
Format:       PNG (transparent background recommended)
Aspect Ratio: 3:1 or 4:1 (horizontal)
Size:         300x80px, 400x100px, or similar
Max Height:   100px
File Size:    Under 50KB
Usage:        Navigation bar, footer
```

### Loading/Login Logo
```
Format:       PNG (transparent background recommended)
Aspect Ratio: 1:1 (square) or 2:3 (vertical)
Size:         512x512px or 400x600px
Max Size:     800x800px
File Size:    Under 200KB
Usage:        Splash screens, loading, authentication pages
```

### App Icon
```
Format:       PNG (NO transparency for app icons)
Aspect Ratio: 1:1 (must be square)
Size:         512x512px (required)
Additional:   192x192px (will be auto-generated)
File Size:    Under 100KB
Background:   Solid color (transparent not recommended for icons)
Usage:        App stores, PWA install, home screen
```

---

## 🎨 Design Tips

### Header/Footer Logo
- ✅ Include your brand name as text
- ✅ Use horizontal layout
- ✅ Keep it simple and readable at small sizes
- ✅ Works well with transparent background

**Example layouts:**
```
[Icon] Brand Name
[Icon] Brand Name | Tagline
Brand Name [Icon]
```

### Loading/Login Logo
- ✅ Your full brand identity
- ✅ Can be more detailed
- ✅ Can include tagline or graphic elements
- ✅ Center-aligned works best
- ✅ Should look good large

### App Icon
- ✅ Simple, recognizable symbol
- ✅ NO text (text becomes unreadable at small sizes)
- ✅ Bold, solid colors
- ✅ High contrast
- ✅ Looks good at 60x60px and smaller
- ❌ Avoid fine details or thin lines
- ❌ Avoid gradients if possible

---

## 🧪 Testing Your Logos

### Visual Check (In-App)

After uploading, check these screens:

**Header Logo:**
1. Navigate to Journal page
2. Check top navigation bar
3. Scroll to footer

**Feature Logo:**
1. Sign out
2. Look at login/signup screens
3. Refresh the page (loading screen)

**App Icon:**
1. Open `/public/manifest.json` to verify paths
2. Test PWA install (see PWA section below)

### Responsive Check

1. Open browser DevTools (F12)
2. Toggle device toolbar
3. Test on different screen sizes:
   - Mobile: 375px width
   - Tablet: 768px width
   - Desktop: 1440px width

### Where Each Logo Appears

**Header Logo (`logoHeader`):**
- ✓ Top navigation bar (all pages)
- ✓ Footer (all pages)

**Feature Logo (`logoFeature`):**
- ✓ Loading screen
- ✓ Login page
- ✓ Signup page
- ✓ Password reset page

**App Icon (`logoIcon`):**
- ✓ Browser tab favicon
- ✓ PWA install prompt
- ✓ Home screen icon (iOS/Android)
- ✓ App store listings
- ✓ Task switcher

---

## 📱 PWA / App Store Setup

### For PWA (Progressive Web App)

The manifest.json is already configured! Just ensure:

```json
{
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512"
    }
  ]
}
```

### For iOS App Store

When building with Capacitor, use your app icon:
```
ios/App/App/Assets.xcassets/AppIcon.appiconset/
  ← Place icon-512.png here (Xcode will generate all sizes)
```

### For Android Play Store

When building with Capacitor, use your app icon:
```
android/app/src/main/res/
  ├── mipmap-hdpi/ic_launcher.png (72x72)
  ├── mipmap-mdpi/ic_launcher.png (48x48)
  ├── mipmap-xhdpi/ic_launcher.png (96x96)
  ├── mipmap-xxhdpi/ic_launcher.png (144x144)
  └── mipmap-xxxhdpi/ic_launcher.png (192x192)
```

Use Android Studio or online tools to generate these from your 512x512 icon.

---

## 🔧 Advanced: Logo Variants for Different Themes

Want different logos for light/dark mode?

### Edit `/components/LogoComponent.tsx`

Add logic around line 30:

```tsx
const getLogoUrl = () => {
  const isDarkMode = document.body.classList.contains('dark');
  
  if (variant === 'header') {
    return isDarkMode ? config.logoHeaderDark : config.logoHeader;
  }
  
  // ... rest of logic
};
```

Then add to BrandConfig interface:
```tsx
logoHeaderDark?: string;
logoFeatureDark?: string;
```

---

## 📊 Logo Usage Examples

### Example 1: Health Tech Startup
```
Header:  "HealthMind" text logo with medical cross icon (horizontal)
Feature: Large medical cross with "HealthMind" below
Icon:    Simple medical cross (no text)
```

### Example 2: Wellness App
```
Header:  "Serene" text with lotus flower icon (horizontal)
Feature: Large lotus flower with "Serene" and tagline
Icon:    Stylized lotus flower (no text)
```

### Example 3: Therapy Platform
```
Header:  "TherapySpace" wordmark with brain icon
Feature: Brain icon with full branding and tagline
Icon:    Simple brain icon in brand color
```

---

## 🆘 Troubleshooting

### Logo Not Showing?

**Check 1:** File paths are correct
- Open browser DevTools → Network tab
- Look for 404 errors
- Ensure files are in `/public` folder

**Check 2:** File names match exactly
- Case-sensitive: `/logo-header.png` ≠ `/Logo-Header.png`
- No spaces in file names

**Check 3:** Clear browser cache
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Logo Looks Blurry?

- Use higher resolution (2x or 3x size)
- Example: Upload 600x160px for header instead of 300x80px
- The app will scale it down (looks sharper)

### Logo Too Big/Small?

The system automatically sizes logos, but you can adjust:

**For Header:** Edit `/components/LogoComponent.tsx` line 42
```tsx
sm: {
  icon: 'h-8 w-8',  // ← Change to h-6 or h-10
```

**For Feature:** Edit line 62
```tsx
xl: {
  icon: 'h-20 w-20',  // ← Change to h-16 or h-24
```

### App Icon Not Updating on Device?

- Uninstall and reinstall PWA
- Clear browser cache
- On iOS: Delete from home screen and re-add
- On Android: Clear app data and re-install

---

## ✅ Checklist

Before deployment, ensure:

- [ ] All three logo files created
- [ ] Files placed in `/public` folder
- [ ] Paths configured in Branding Customizer
- [ ] Header logo appears in navigation
- [ ] Feature logo appears on login screen
- [ ] App icon configured in manifest.json
- [ ] Tested on mobile devices
- [ ] Tested PWA install
- [ ] All logos look sharp (not blurry)
- [ ] Logos work on light backgrounds
- [ ] App icon has solid background (no transparency)

---

## 📝 Quick Reference

| Logo Type | File Name | Size | Where Used |
|-----------|-----------|------|------------|
| Header | `logo-header.png` | 300x80px | Navigation, Footer |
| Feature | `logo-feature.png` | 512x512px | Loading, Login |
| Icon | `icon-512.png` | 512x512px | App Store, PWA |

---

## 🎓 Need Help?

Common questions:

**Q: Can I use the same logo for all three?**
A: Yes, but it's not recommended. Different contexts need different formats.

**Q: Do I need all three logos?**
A: No, the app works with just one. But using all three provides the best experience.

**Q: Can I use JPG instead of PNG?**
A: Yes, but PNG is better (supports transparency). App icon should NOT be transparent.

**Q: What if I don't have a designer?**
A: Use tools like Canva, Figma, or hire someone on Fiverr for $20-50.

**Q: Can I change logos later?**
A: Yes! Just update the files or URLs in the Branding Customizer.

---

## Summary

✅ **Header Logo:** Horizontal, with text, for navigation
✅ **Feature Logo:** Large, main brand, for loading/login
✅ **App Icon:** Square, simple, for app stores

Place all files in `/public` folder and configure URLs in the Branding Customizer!
