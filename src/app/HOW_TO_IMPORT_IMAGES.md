# How to Import and Use PNG Images

## Quick Guide: Replacing Icons with PNG Images

### Step 1: Import the ImageWithFallback Component

At the top of your component file, add this import:

```tsx
import { ImageWithFallback } from './figma/ImageWithFallback';
```

**Important:** Adjust the path based on where your file is located:
- From `/components/YourComponent.tsx` → `'./figma/ImageWithFallback'`
- From `/App.tsx` → `'./components/figma/ImageWithFallback'`

### Step 2: Use ImageWithFallback for Your PNG

Replace the icon component with ImageWithFallback:

```tsx
// OLD WAY (with icon):
<Heart className="h-5 w-5 text-pink-500" />

// NEW WAY (with PNG):
<ImageWithFallback 
  src="YOUR_IMAGE_URL_HERE" 
  alt="Heart icon"
  className="h-5 w-5 object-contain"
/>
```

### Step 3: Where to Get Image URLs

**Option 1: Use Your Own Hosted Images**
- Upload your PNG to a hosting service (Cloudinary, AWS S3, etc.)
- Use the full URL: `src="https://yourdomain.com/images/heart.png"`

**Option 2: Use Unsplash (Stock Photos)**
- Ask me to search for an image and I'll provide the URL
- Example: "Can you find a heart icon image?"

**Option 3: Use Data URLs (For Small Images)**
```tsx
src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
```

## Example: Current Implementation

In `/components/JournalEntry.tsx`, I've already replaced the heart icon for the "Overall Mood" emotion:

```tsx
{
  key: 'overall' as keyof EmotionData,
  label: 'Overall Mood',
  description: 'How would you rate your overall mood?',
  icon: Heart, // Fallback if iconImage fails
  iconImage: 'https://images.unsplash.com/photo-1644354567105-2f1c85198773...',
  color: 'text-pink-500',
  lowLabel: 'Poor',
  highLabel: 'Excellent'
}
```

The component then checks if `iconImage` exists and uses it:

```tsx
{iconImage ? (
  <ImageWithFallback 
    src={iconImage} 
    alt={label}
    className="h-5 w-5 sm:h-6 sm:w-6 object-contain flex-shrink-0"
  />
) : (
  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${color} flex-shrink-0`} />
)}
```

## Common Use Cases

### 1. Replace Other Icons in JournalEntry
Add `iconImage` to any emotion in the `coreEmotions` or `premiumEmotions` arrays:

```tsx
{
  key: 'happiness' as keyof EmotionData,
  label: 'Happiness & Joy',
  icon: Smile,
  iconImage: 'YOUR_IMAGE_URL_HERE', // Add this line
  color: 'text-yellow-500',
  // ...
}
```

### 2. Replace Navigation Icons in App.tsx
Find the navigation tabs and replace:

```tsx
// OLD:
<Heart className="h-4 w-4" />

// NEW:
<ImageWithFallback 
  src="YOUR_IMAGE_URL_HERE" 
  alt="Journal"
  className="h-4 w-4 object-contain"
/>
```

### 3. Replace Logo in Header
The LogoComponent already supports custom images. Update it in the BrandingCustomizer or BrandingProvider.

## Styling Tips

### Object-fit Classes
- `object-contain` - Scales image to fit without cropping (best for icons)
- `object-cover` - Fills space, may crop (best for backgrounds)
- `object-fill` - Stretches to fill (can distort)

### Size Classes
- `h-4 w-4` - Small (16px)
- `h-5 w-5` - Medium (20px)
- `h-6 w-6` - Large (24px)
- `h-8 w-8` - Extra Large (32px)

### Responsive Sizing
```tsx
className="h-5 w-5 sm:h-6 sm:w-6"
// 20px on mobile, 24px on desktop
```

## What if the Image Fails to Load?

The `ImageWithFallback` component automatically shows a placeholder if the image fails to load. You can also keep the icon as a fallback by using the conditional rendering pattern shown above.

## Need Help?

Just ask me to:
- "Find a [type] icon/image for me"
- "Replace the [icon name] with a PNG"
- "Show me how to use my own image URL"
