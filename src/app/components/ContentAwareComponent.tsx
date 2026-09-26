import React from 'react';
import { useBranding } from './BrandingProvider';
import { contentConfig, getContent, themeContent } from '../config/content';

// Example of how to use the content configuration system
export function ContentAwareHeader() {
  const { config } = useBranding();
  
  // Get theme-specific content if available
  const themeSpecificContent = themeContent[config.theme as keyof typeof themeContent];
  const journalTitle = themeSpecificContent?.journal?.title || contentConfig.journal.title;
  
  return (
    <div>
      <h1>{journalTitle}</h1>
      <p>{config.tagline}</p>
    </div>
  );
}

// Example of using the getContent helper with replacements
export function WelcomeMessage({ userName, dayCount }: { userName: string; dayCount: number }) {
  const welcomeText = getContent('encouragement.trial.title', { 
    days: dayCount.toString() 
  });
  
  return (
    <div>
      <p>Hello {userName}!</p>
      <p>{welcomeText}</p>
    </div>
  );
}

// Example of conditional content based on subscription
export function SubscriptionAwareContent({ isPremium }: { isPremium: boolean }) {
  const planContent = isPremium 
    ? contentConfig.subscription.premium 
    : contentConfig.subscription.free;
    
  return (
    <div>
      <h3>{planContent.name}</h3>
      <p>{planContent.description}</p>
      <ul>
        {planContent.features.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
    </div>
  );
}

// Hook for easier content access
export function useContent() {
  const { config } = useBranding();
  
  const getThemeContent = (path: string, replacements: Record<string, string> = {}) => {
    // Try to get theme-specific content first
    const themeSpecific = themeContent[config.theme as keyof typeof themeContent];
    if (themeSpecific) {
      const keys = path.split('.');
      let content: any = themeSpecific;
      
      for (const key of keys) {
        content = content?.[key];
        if (content === undefined) break;
      }
      
      if (content !== undefined) {
        return typeof content === 'string' 
          ? Object.entries(replacements).reduce((str, [key, value]) => 
              str.replace(new RegExp(`{${key}}`, 'g'), value), content)
          : content;
      }
    }
    
    // Fall back to default content
    return getContent(path, replacements);
  };
  
  return { getThemeContent, contentConfig };
}