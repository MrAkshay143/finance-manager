'use client';

export default function Skeleton({
  type = 'line',
  width,
  height,
  className = '',
  count = 1,
  circle = false,
  rounded = true,
}) {
  const baseClasses = `
    bg-gray-200 animate-pulse
    ${rounded && !circle ? 'rounded-md' : ''}
    ${circle ? 'rounded-full' : ''}
    ${className}
  `;
  
  // Predefined types
  const types = {
    line: { height: '1rem', width: '100%' },
    text: { height: '0.8rem', width: '100%' },
    title: { height: '1.5rem', width: '70%' },
    avatar: { height: '3rem', width: '3rem', circle: true },
    button: { height: '2.5rem', width: '8rem', rounded: true },
    card: { height: '12rem', width: '100%', rounded: true },
    image: { height: '10rem', width: '100%', rounded: true },
  };
  
  // Get dimensions from type or props
  const dimensions = types[type] || {};
  const finalWidth = width || dimensions.width || '100%';
  const finalHeight = height || dimensions.height || '1rem';
  const finalCircle = circle || dimensions.circle || false;
  const finalRounded = rounded !== undefined ? rounded : dimensions.rounded !== undefined ? dimensions.rounded : true;
  
  // Create skeleton items
  const items = Array(count).fill(0).map((_, index) => (
    <div
      key={index}
      className={`
        ${baseClasses}
        ${finalCircle ? 'rounded-full' : ''}
        ${finalRounded && !finalCircle ? 'rounded-md' : ''}
      `}
      style={{
        width: finalWidth,
        height: finalHeight,
        marginBottom: index < count - 1 ? '0.5rem' : 0,
      }}
    />
  ));
  
  return <>{items}</>;
}

// Predefined skeleton components
export function SkeletonText({ lines = 3, lastLineWidth = '70%', className = '' }) {
  return (
    <div className={className}>
      {Array(lines - 1).fill(0).map((_, index) => (
        <Skeleton key={index} type="text" className="mb-2" />
      ))}
      <Skeleton type="text" width={lastLineWidth} />
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`border border-gray-200 rounded-xl overflow-hidden ${className}`}>
      <Skeleton type="image" height="10rem" rounded={false} />
      <div className="p-4">
        <Skeleton type="title" className="mb-3" />
        <SkeletonText lines={2} />
      </div>
    </div>
  );
}

export function SkeletonAvatar({ size = 'md', className = '' }) {
  const sizes = {
    sm: '2rem',
    md: '3rem',
    lg: '4rem',
    xl: '6rem',
  };
  
  return (
    <Skeleton 
      circle 
      width={sizes[size] || size} 
      height={sizes[size] || size} 
      className={className} 
    />
  );
}

export function SkeletonButton({ width = '8rem', className = '' }) {
  return (
    <Skeleton 
      type="button" 
      width={width} 
      className={className} 
    />
  );
}

export function SkeletonList({ rows = 5, className = '' }) {
  return (
    <div className={className}>
      {Array(rows).fill(0).map((_, index) => (
        <div key={index} className="flex items-center py-3 border-b border-gray-100">
          <SkeletonAvatar size="sm" className="mr-3" />
          <div className="flex-1">
            <Skeleton type="title" className="mb-1" />
            <Skeleton type="text" width="60%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }) {
  return (
    <div className={className}>
      {/* Header */}
      <div className="flex border-b border-gray-200 py-3">
        {Array(cols).fill(0).map((_, index) => (
          <div key={index} className="flex-1 px-2">
            <Skeleton type="text" width="80%" />
          </div>
        ))}
      </div>
      
      {/* Rows */}
      {Array(rows).fill(0).map((_, rowIndex) => (
        <div key={rowIndex} className="flex border-b border-gray-100 py-4">
          {Array(cols).fill(0).map((_, colIndex) => (
            <div key={colIndex} className="flex-1 px-2">
              <Skeleton type="text" width={colIndex === 0 ? '70%' : '60%'} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
} 