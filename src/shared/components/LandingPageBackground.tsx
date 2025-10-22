import React from 'react';
import { color } from '../utils/utils';

/**
 * LandingPageBackground Component
 * 
 * A fixed background component specifically for the authenticated landing page.
 * Uses the same gradient colors as the sidebar with the original pattern overlay.
 * Copies the exact same patterns from FixedBackground but with our gradient colors.
 */
export default function LandingPageBackground() {
    return (
        <div
            className="fixed inset-0 w-full h-full pointer-events-none z-0"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                background: `linear-gradient(to bottom, ${color.gradients.sidebar.top} 0%, ${color.gradients.sidebar.middle} 70%, ${color.gradients.sidebar.bottom} 100%)`
            }}
        >
            <div className="fixed-bg-hex" style={{ backgroundColor: 'transparent' }}></div>
            <div className="fixed-bg-grid" style={{ backgroundColor: 'transparent' }}></div>
        </div>
    );
}
