import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BrandConfig {
  // App Identity
  appName: string;
  tagline: string;
  logo?: string;
  logoHeader?: string;      // Horizontal logo for header/footer
  logoFeature?: string;     // Large logo for loading/login screens
  logoIcon?: string;        // Square icon for app stores/PWA
  
  // Color Theme
  theme: 'healthcare' | 'therapy' | 'wellness' | 'startup' | 'custom';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  
  // Typography
  fontFamily: 'modern' | 'friendly' | 'professional' | 'custom';
  customFontUrl?: string;
  
  // UI Personality
  borderRadius: 'soft' | 'sharp' | 'organic';
  animationStyle: 'subtle' | 'bouncy' | 'professional';
  
  // Emotion Colors (for sliders and charts)
  emotionColors: {
    happiness: string;
    anxiety: string;
    sadness: string;
    anger: string;
    energy: string;
    overall: string;
  };
  
  // Business Details
  supportEmail: string;
  website?: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
}

const defaultBrandConfig: BrandConfig = {
  appName: 'Mood2Day',
  tagline: 'HIPAA-compliant emotional wellness tracking',
  logoHeader: 'https://i.imgur.com/dhFSRO2.png',
  logoFeature: 'https://i.imgur.com/ReSVEdV.png?v=5',
  logoIcon: 'https://i.imgur.com/FRDC1EM.png?v=5',
  theme: 'healthcare',
  primaryColor: '#2563eb',
  secondaryColor: '#0d9488',
  accentColor: '#f3e8ff',
  fontFamily: 'modern',
  borderRadius: 'soft',
  animationStyle: 'subtle',
  emotionColors: {
    happiness: '#fbbf24',
    anxiety: '#f97316',
    sadness: '#3b82f6',
    anger: '#ef4444',
    energy: '#8b5cf6',
    overall: '#ec4899'
  },
  supportEmail: 'support@emotionjournal.com'
};

// Version number to force updates when logos change
const BRAND_CONFIG_VERSION = 6;

interface BrandContextType {
  config: BrandConfig;
  updateBrand: (updates: Partial<BrandConfig>) => void;
  applyTheme: (theme: BrandConfig['theme']) => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<BrandConfig>(defaultBrandConfig);

  useEffect(() => {
    // Check version and force update if needed
    const savedVersion = localStorage.getItem('brandConfigVersion');
    const savedConfig = localStorage.getItem('brandConfig');
    
    if (savedVersion !== String(BRAND_CONFIG_VERSION)) {
      // Version mismatch - force update with new logos
      console.log('Brand config version mismatch, updating logos...');
      localStorage.setItem('brandConfigVersion', String(BRAND_CONFIG_VERSION));
      
      // If there was a saved config, merge it but force new logos
      if (savedConfig) {
        try {
          const parsedConfig = JSON.parse(savedConfig);
          const updatedConfig = {
            ...parsedConfig,
            logoHeader: defaultBrandConfig.logoHeader,
            logoFeature: defaultBrandConfig.logoFeature,
            logoIcon: defaultBrandConfig.logoIcon
          };
          setConfig(updatedConfig);
          localStorage.setItem('brandConfig', JSON.stringify(updatedConfig));
        } catch (error) {
          console.error('Failed to load brand config:', error);
          setConfig(defaultBrandConfig);
        }
      } else {
        setConfig(defaultBrandConfig);
      }
    } else if (savedConfig) {
      // Version matches, load normally
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig({ ...defaultBrandConfig, ...parsedConfig });
      } catch (error) {
        console.error('Failed to load brand config:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Apply CSS custom properties based on current config
    applyBrandingToDOM(config);
    
    // Save to localStorage
    localStorage.setItem('brandConfig', JSON.stringify(config));
  }, [config]);

  const updateBrand = (updates: Partial<BrandConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const applyTheme = (theme: BrandConfig['theme']) => {
    const themeConfigs = {
      healthcare: {
        primaryColor: '#2563eb',
        secondaryColor: '#0d9488',
        accentColor: '#f3e8ff',
        emotionColors: {
          happiness: '#fbbf24',
          anxiety: '#f97316',
          sadness: '#3b82f6',
          anger: '#ef4444',
          energy: '#8b5cf6',
          overall: '#ec4899'
        }
      },
      therapy: {
        primaryColor: '#7c3aed',
        secondaryColor: '#0d9488',
        accentColor: '#f3e8ff',
        emotionColors: {
          happiness: '#fcd34d',
          anxiety: '#fb7185',
          sadness: '#60a5fa',
          anger: '#f87171',
          energy: '#a78bfa',
          overall: '#f472b6'
        }
      },
      wellness: {
        primaryColor: '#92400e',
        secondaryColor: '#065f46',
        accentColor: '#fef3c7',
        emotionColors: {
          happiness: '#fbbf24',
          anxiety: '#fb923c',
          sadness: '#7dd3fc',
          anger: '#fca5a5',
          energy: '#34d399',
          overall: '#fbbf24'
        }
      },
      startup: {
        primaryColor: '#1d4ed8',
        secondaryColor: '#7c2d12',
        accentColor: '#dbeafe',
        emotionColors: {
          happiness: '#facc15',
          anxiety: '#f97316',
          sadness: '#3b82f6',
          anger: '#ef4444',
          energy: '#8b5cf6',
          overall: '#06b6d4'
        }
      },
      custom: config // Keep current config for custom theme
    };

    const themeConfig = themeConfigs[theme];
    updateBrand({ theme, ...themeConfig });
  };

  return (
    <BrandContext.Provider value={{ config, updateBrand, applyTheme }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}

// Helper function to apply branding to DOM
function applyBrandingToDOM(config: BrandConfig) {
  const root = document.documentElement;
  
  // Apply color variables
  root.style.setProperty('--primary', config.primaryColor);
  root.style.setProperty('--secondary', config.secondaryColor);
  root.style.setProperty('--accent', config.accentColor);
  
  // Apply emotion colors
  Object.entries(config.emotionColors).forEach(([emotion, color]) => {
    root.style.setProperty(`--emotion-${emotion}`, color);
  });
  
  // Apply font family
  if (config.fontFamily === 'custom' && config.customFontUrl) {
    const link = document.createElement('link');
    link.href = config.customFontUrl;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  
  // Apply theme class
  document.body.className = document.body.className.replace(/theme-\w+/g, '');
  document.body.classList.add(`theme-${config.theme}`);
  document.body.classList.add(`font-brand-${config.fontFamily}`);
  document.body.classList.add(`rounded-brand-${config.borderRadius}`);
}

// Utility function to get emotion color
export function getEmotionColor(emotion: keyof BrandConfig['emotionColors'], config: BrandConfig): string {
  return config.emotionColors[emotion];
}

// Example brand configurations for quick setup
export const brandPresets = {
  mentalHealthClinic: {
    appName: 'MindFlow',
    tagline: 'Professional mental health tracking',
    theme: 'therapy' as const,
    fontFamily: 'professional' as const,
    borderRadius: 'sharp' as const,
    supportEmail: 'support@mindflow.clinic'
  },
  
  wellnessStudio: {
    appName: 'Serene',
    tagline: 'Your personal wellness companion',
    theme: 'wellness' as const,
    fontFamily: 'friendly' as const,
    borderRadius: 'organic' as const,
    supportEmail: 'hello@serene.wellness'
  },
  
  digitalTherapy: {
    appName: 'TherapyTech',
    tagline: 'Modern therapy, backed by data',
    theme: 'startup' as const,
    fontFamily: 'modern' as const,
    borderRadius: 'soft' as const,
    supportEmail: 'support@therapytech.app'
  }
};