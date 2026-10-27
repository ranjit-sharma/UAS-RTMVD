// src/components/common/Logo.jsx
export function Logo({ size = 'medium', showText = true, className = '' }) {
  const iconSizes = {
    small: 'w-7 h-7 text-lg',
    medium: 'w-10 h-10 text-2xl',
    large: 'w-16 h-16 text-4xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* High-Tech UAS-RTMVD Radiosonde Radar SVG Icon */}
      <div
        className={`flex items-center justify-center shrink-0 rounded-2xl ${iconSizes[size]} relative overflow-hidden shadow-lg shadow-black/20`}
        style={{ background: 'var(--text-main)', color: 'var(--neu-bg)' }}
      >
        <div className="absolute inset-0 bg-white/10 blur-md rounded-full scale-150 -top-1/2 -left-1/2" />
        <svg
          className="w-[55%] h-[55%] relative z-10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Sleek Weather Balloon SVG */}
          <path d="M12 2C8.68629 2 6 4.68629 6 8C6 11.75 11.5 18 12 18C12.5 18 18 11.75 18 8C18 4.68629 15.3137 2 12 2Z" fill="currentColor" fillOpacity="0.15"/>
          <path d="M12 18V21" />
          <rect x="10" y="21" width="4" height="2" rx="0.5" fill="currentColor" />
          <path d="M7 7.5C7 7.5 9 8.5 12 8.5C15 8.5 17 7.5 17 7.5" stroke="currentColor" opacity="0.6" strokeWidth="1.5" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <h1 className="font-bold text-base tracking-tight grad-text-primary leading-none">
            UAS-RTMVD
          </h1>
          <p className="text-subtle text-[11px] font-medium tracking-wide mt-1">
            Real-Time Monitoring & Visualization
          </p>
        </div>
      )}
    </div>
  );
}
