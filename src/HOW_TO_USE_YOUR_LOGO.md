# How to Use Your Custom PNG Logo

## Quick Start Guide

Your app is already set up to use custom logos! Here are **3 easy ways** to add your PNG logo:

---

## Method 1: Using the Built-in Branding Customizer (Easiest)

1. **Launch your app** and sign in
2. **Click the "Customize" tab** in the navigation
3. Go to the **"Identity"** section
4. In the **"Logo Image URL"** field, paste your logo URL
5. Your logo will **instantly appear** throughout the app!

### Where to Get a Logo URL:

**Option A: Quick Test (Free Image Hosting)**
- Go to [Imgur.com](https://imgur.com)
- Upload your PNG logo
- Right-click the image → "Copy image address"
- Paste the URL into the Logo field

**Option B: Professional Hosting**
- Upload to your hosting service (Cloudinary, AWS S3, Google Cloud Storage)
- Get the direct image URL
- Paste into the Logo field

**Option C: Local Development (Best for Production)**
- See Method 2 below

---

## Method 2: For Production - Using the Public Folder

This is the **recommended method** for your final app deployment.

### Steps:

1. **Locate your PNG logo file** (e.g., `my-logo.png`)

2. **Create a `/public` folder** in your project root if it doesn't exist

3. **Copy your logo** into the `/public` folder:
   ```
   /public
     └── logo.png
   ```

4. **In the Branding Customizer**, enter this as your Logo URL:
   ```
   /logo.png
   ```

5. **That's it!** Your logo is now served with your app.

### Why This Method is Better for Production:
- ✅ No external dependencies
- ✅ Faster loading (served from your domain)
- ✅ No broken links
- ✅ Works offline (PWA support)
- ✅ HIPAA compliant (data stays on your server)

---

## Method 3: Programmatic (For Developers)

If you want to hardcode your logo URL in the code:

### Edit: `/components/BrandingProvider.tsx`

Find this section (around line 40):

```tsx
const defaultBrandConfig: BrandConfig = {
  appName: 'Emotion Journal',
  tagline: 'HIPAA-compliant emotional wellness tracking',
  logo: undefined,  // ← Change this line
  theme: 'healthcare',
  // ... rest of config
};
```

**Replace with:**

```tsx
const defaultBrandConfig: BrandConfig = {
  appName: 'Emotion Journal',
  tagline: 'HIPAA-compliant emotional wellness tracking',
  logo: '/logo.png',  // ← Your logo path
  theme: 'healthcare',
  // ... rest of config
};
```

---

## Logo Best Practices

### Size & Format
- **Format:** PNG with transparent background (recommended)
- **Size:** 512x512px or larger (square works best)
- **File size:** Keep under 100KB for fast loading
- **Alternative:** SVG format also works great

### Aspect Ratio
- **Square logos** (1:1) work best
- **Horizontal logos** (2:1 or 3:1) also work well
- The app automatically scales logos proportionally

### Multiple Sizes
The app uses your logo in different sizes:
- **Header:** Small (24px height)
- **Loading screen:** Large (64px height)
- **Footer:** Small (24px height)
- **Auth screens:** Large (48px height)

Your logo will automatically scale to fit each location!

---

## Testing Your Logo

### Quick Visual Check:

After adding your logo, check these screens:

1. **Header** (top navigation bar)
2. **Loading screen** (refresh the page)
3. **Footer** (scroll to bottom)
4. **Auth screen** (sign out and look at login page)

### Mobile Responsive Check:

1. Open browser DevTools (F12)
2. Click the mobile device icon
3. View your app on different screen sizes
4. Verify logo looks good on all sizes

---

## Troubleshooting

### Logo Not Appearing?

**Check 1:** Is the URL correct?
- Open the URL directly in your browser
- Should see just your logo image

**Check 2:** Is it a direct image URL?
- URL should end with `.png`, `.jpg`, or `.svg`
- Should NOT be a webpage with an image on it

**Check 3:** CORS Issues?
- If using external hosting, ensure CORS headers are enabled
- Or use Method 2 (public folder) to avoid CORS

### Logo Looks Blurry?

- Upload a higher resolution version
- Use at least 512x512px for best quality
- Try SVG format for infinite scaling

### Logo Too Big/Small?

The app automatically sizes logos, but if needed:

1. Go to `/components/LogoComponent.tsx`
2. Adjust the size configurations (lines 33-76)
3. Customize icon sizes for each breakpoint

---

## Examples of Logo Placement

Your logo appears in these locations:

### 1. **Header (Top Navigation)**
```tsx
// Already implemented at line 176 in /App.tsx
<LogoComponent 
  size="sm" 
  showText={true} 
  layout="horizontal"
  className="cursor-pointer"
/>
```

### 2. **Loading Screen**
```tsx
// Already implemented at line 140 in /App.tsx
<LogoComponent 
  size="xl" 
  showText={true} 
  className="mx-auto"
  animate={true}
/>
```

### 3. **Footer**
```tsx
// Already implemented at line 411 in /App.tsx
<LogoComponent 
  size="sm" 
  showText={true} 
  layout="horizontal"
  className="opacity-60"
/>
```

---

## Advanced: Using Different Logos for Different Contexts

If you want different logos for light/dark modes or different pages:

### Edit: `/components/LogoComponent.tsx`

Add conditional logic:

```tsx
const renderIcon = () => {
  // Use different logos based on context
  const logoUrl = isDarkMode ? config.logoDark : config.logo;
  
  if (logoUrl) {
    return <img src={logoUrl} alt={config.appName} />;
  }
  // ... fallback
};
```

---

## Need More Help?

### Common Questions:

**Q: Can I use a JPG instead of PNG?**
A: Yes, but PNG is recommended for logos (supports transparency)

**Q: Can I animate my logo?**
A: Yes! Use the `animate={true}` prop on LogoComponent

**Q: Can I have text next to my logo?**
A: Yes! Use `showText={true}` on LogoComponent

**Q: Can I use an animated GIF?**
A: Yes, but keep file size small (under 500KB)

**Q: What if I don't have a logo yet?**
A: The app uses a default heart icon until you add one

---

## Summary

✅ **Fastest:** Use Branding Customizer with Imgur URL (Method 1)
✅ **Production:** Put logo.png in /public folder (Method 2)
✅ **Advanced:** Edit BrandingProvider.tsx (Method 3)

Your logo will automatically appear in:
- Header navigation
- Loading screens  
- Footer
- Auth pages
- And anywhere else LogoComponent is used!
