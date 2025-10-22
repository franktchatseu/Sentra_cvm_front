import React from 'react';

/**
 * FixedBackground Component
 * 
 * A fixed background component that doesn't scroll and maintains its pattern.
 * The background stays in place while content scrolls over it.
 * 
 * @param variant - The background pattern variant:
 *   - 'default': Combines gradients, hexagons, and grid patterns
 *   - 'subtle': Subtle, cute pattern for all pages
 *   - 'gradient': Only gradient patterns
 *   - 'hexagon': Only animated hexagon patterns
 *   - 'grid': Only grid patterns
 *   - 'particles': Only particle/dot patterns
 * @param className - Additional CSS classes to apply
 * 
 * @example
 * // Use default background (recommended)
 * <FixedBackground />
 * 
 * // Use only gradient background
 * <FixedBackground variant="gradient" />
 * 
 * // Use custom styling
 * <FixedBackground variant="hexagon" className="opacity-50" />
 */
interface FixedBackgroundProps {
  variant?: 'default' | 'subtle' | 'gradient' | 'hexagon' | 'grid' | 'particles' | 'landingpage';
  className?: string;
}

export default function FixedBackground({
  variant = 'default',
  className = ''
}: FixedBackgroundProps) {
  const getBackgroundContent = () => {
    switch (variant) {
      case 'gradient':
        return (
          <div className="fixed-bg-gradients"></div>
        );

      case 'hexagon':
        return (
          <div className="fixed-bg-hex"></div>
        );

      case 'grid':
        return (
          <div className="fixed-bg-grid"></div>
        );

      case 'particles':
        return (
          <div className="fixed-bg-particles"></div>
        );

      case 'subtle':
        return (
          <div className="fixed-bg-subtle"></div>
        );

      case 'landingpage':
        return (
          <>
            {/* <div className="fixed-bg-gradients"></div> */}
            <div className="fixed-bg-hex"></div>
            <div className="fixed-bg-grid"></div>
          </>
        );

      case 'default':
      default:
        return (
          <>
            <div className="fixed-bg-gradients"></div>
            <div className="fixed-bg-hex"></div>
            <div className="fixed-bg-grid"></div>
          </>
        );
    }
  };

  return (
    <div
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: variant === 'subtle' ? '#f3f4f6' : variant === 'landingpage' ? 'transparent' : 'var(--primary-color)',
        background: variant === 'landingpage' ? 'linear-gradient(to bottom, #0F1214 0%, #1A1F21 15%, #22282A 30%, #394247 50%, #5F6F77 80%, #394247 100%)' : undefined
      }}
    >
      {getBackgroundContent()}
    </div>
  );
}
