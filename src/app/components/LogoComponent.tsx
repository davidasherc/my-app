import { useBranding } from './BrandingProvider';
import { Heart } from 'lucide-react';
import { cn } from './ui/utils';

interface LogoComponentProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  showText?: boolean;
  showTagline?: boolean;
  layout?: 'horizontal' | 'vertical' | 'icon-only' | 'text-only';
  className?: string;
  onClick?: () => void;
  animate?: boolean;
  variant?: 'header' | 'feature' | 'icon' | 'auto';
  textColor?: string;
  taglineColor?: string;
  customSize?: {
    icon?: string;
    text?: string;
    container?: string;
    tagline?: string;
  };
}

export function LogoComponent({
  size = 'md',
  showText = false,
  showTagline = false,
  layout = 'horizontal',
  className = '',
  onClick,
  animate = false,
  variant = 'auto',
  textColor = '#ffffff',
  taglineColor,
  customSize
}: LogoComponentProps) {
  const { config } = useBranding();

  // NEW: Helper function to select the right logo variant
  const getLogoUrl = () => {
    // If variant is explicitly set, use that
    if (variant === 'header' && config.logoHeader) return config.logoHeader;
    if (variant === 'feature' && config.logoFeature) return config.logoFeature;
    if (variant === 'icon' && config.logoIcon) return config.logoIcon;
    
    // Auto-detect based on size and layout
    if (variant === 'auto') {
      // Use icon variant for icon-only layouts
      if (layout === 'icon-only' && config.logoIcon) return config.logoIcon;
      
      // Use header variant for small horizontal layouts
      if ((size === 'xs' || size === 'sm') && layout === 'horizontal' && config.logoHeader) {
        return config.logoHeader;
      }
      
      // Use feature variant for large/vertical layouts
      if ((size === 'lg' || size === 'xl' || layout === 'vertical') && config.logoFeature) {
        return config.logoFeature;
      }
    }
    
    // Fallback to generic logo or the first available variant
    return config.logo || config.logoHeader || config.logoFeature || config.logoIcon;
  };

  // Size configurations
  const sizeConfig = {
    xs: {
      icon: 'h-4 w-4',
      text: 'text-sm',
      tagline: 'text-xs',
      gap: 'gap-1',
      container: 'h-6'
    },
    sm: {
      icon: 'h-8 w-8',
      text: 'text-base',
      tagline: 'text-xs',
      gap: 'gap-2',
      container: 'h-11'
    },
    md: {
      icon: 'h-8 w-8',
      text: 'text-lg',
      tagline: 'text-sm',
      gap: 'gap-3',
      container: 'h-10'
    },
    lg: {
      icon: 'h-12 w-12',
      text: 'text-xl',
      tagline: 'text-base',
      gap: 'gap-4',
      container: 'h-16'
    },
    xl: {
      icon: 'h-16 w-16',
      text: 'text-2xl',
      tagline: 'text-lg',
      gap: 'gap-5',
      container: 'h-20'
    },
    custom: {
      icon: customSize?.icon || 'h-8 w-8',
      text: customSize?.text || 'text-lg',
      tagline: customSize?.tagline || 'text-sm',
      gap: 'gap-3',
      container: customSize?.container || 'h-10'
    }
  };

  const sizes = sizeConfig[size];

  // Layout configurations
  const layoutConfig = {
    horizontal: 'flex items-center',
    vertical: 'flex flex-col items-center justify-center text-center',
    'icon-only': 'flex items-center justify-center',
    'text-only': 'flex flex-col text-left'
  };

  const renderIcon = () => {
    if (layout === 'text-only') return null;

    const logoUrl = getLogoUrl(); // NEW: Use the smart logo selector

    const iconElement = logoUrl ? (
      <img 
        src={logoUrl} 
        alt={config.appName}
        className={cn(
          sizes.icon,
          'object-contain',
          animate && 'animate-pulse'
        )}
      />
    ) : (
      <Heart 
        className={cn(
          sizes.icon,
          animate && 'animate-pulse'
        )}
        style={{ color: config.primaryColor }}
      />
    );

    return (
      <div 
        className={cn(
          'rounded-full flex items-center justify-center flex-shrink-0',
          logoUrl ? '' : 'bg-opacity-20',
          sizes.container
        )}
        style={{
          backgroundColor: logoUrl ? 'transparent' : `${config.primaryColor}20`
        }}
      >
        {iconElement}
      </div>
    );
  };

  const renderText = () => {
    if (layout === 'icon-only' || (!showText && !showTagline)) return null;

    return (
      <div className={cn(
        'flex flex-col',
        layout === 'horizontal' ? 'text-left' : 'text-center'
      )} style={{ position: 'relative', top: '4px' }}>
        {showText && (
          <div
            className={cn(
              'font-semibold leading-tight',
              sizes.text
            )}
            style={{ color: textColor, fontFamily: 'bc-alphapipe, graphie, sans-serif' }}
          >
            {config.appName}
          </div>
        )}
        {showTagline && config.tagline && (
          <div
            className={cn(
              'font-medium leading-tight mt-0.5',
              sizes.tagline
            )}
            style={{ fontFamily: "'KoHo', sans-serif", position: 'relative', top: '-4px', color: taglineColor ?? textColor, lineHeight: '1.1' }}
          >
            {config.tagline}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        layoutConfig[layout],
        sizes.gap,
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
        animate && 'animate-fade-in',
        className
      )}
      onClick={onClick}
    >
      {renderIcon()}
      {renderText()}
    </div>
  );
}

// Specific logo variants for common use cases
export function HeaderLogo({ onClick }: { onClick?: () => void }) {
  return (
    <LogoComponent
      size="sm"
      showText={true}
      layout="horizontal"
      onClick={onClick}
      className="hover:opacity-80 transition-opacity cursor-pointer"
    />
  );
}

export function LoadingLogo() {
  return (
    <LogoComponent
      size="xl"
      showText={true}
      showTagline={true}
      layout="vertical"
      animate={true}
      className="select-none"
    />
  );
}

export function FooterLogo() {
  return (
    <LogoComponent
      size="sm"
      showText={true}
      layout="horizontal"
      className="opacity-60"
    />
  );
}

export function SidebarLogo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <LogoComponent
      size="sm"
      showText={!collapsed}
      layout={collapsed ? 'icon-only' : 'horizontal'}
      className="transition-all duration-200"
    />
  );
}

export function AuthPageLogo({ textColor, taglineColor }: { textColor?: string; taglineColor?: string }) {
  return (
    <LogoComponent
      size="custom"
      showText={true}
      showTagline={true}
      layout="vertical"
      className="mb-6"
      textColor={textColor}
      taglineColor={taglineColor}
      customSize={{
        icon: 'h-[70px] w-[70px]',
        container: 'h-[70px]',
        text: 'text-[1.65rem]',
        tagline: 'text-xl'
      }}
    />
  );
}

// Custom watermark component for background/subtle branding
export function BrandWatermark({ className = '' }: { className?: string }) {
  const { config } = useBranding();
  
  return (
    <div className={cn('fixed bottom-4 right-4 opacity-5 pointer-events-none z-0', className)}>
      <LogoComponent
        size="xl"
        showText={true}
        layout="vertical"
        className="text-gray-500"
      />
    </div>
  );
}