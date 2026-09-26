import React from 'react';

interface PageHeaderProps {
  headline: string;
  subhead?: React.ReactNode;
}

export function PageHeader({ headline, subhead }: PageHeaderProps) {
  return (
    <div className="text-center space-y-1 px-2 mb-4">
      <h1
        className="font-bold text-white"
        style={{ fontFamily: 'graphie, sans-serif', fontSize: 'clamp(1.29rem, 4vw, 1.54rem)' }}
      >
        {headline}
      </h1>
      {subhead && (
        <p
          className="text-white/80 text-sm sm:text-base font-semibold"
          style={{ fontFamily: "'KoHo', sans-serif", position: 'relative', top: '-4px' }}
        >
          {subhead}
        </p>
      )}
    </div>
  );
}
