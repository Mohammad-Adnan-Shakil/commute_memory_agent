import { memo } from "react";

function LogoIcon({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Commute Memory Agent logo"
    >
      <rect width="48" height="48" rx="12" fill="#060911" />
      <path
        d="M9 34 C9 12, 39 12, 39 34"
        stroke="#2dd4bf"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M39 34 C39 44, 9 44, 9 34"
        stroke="#f59e0b"
        strokeWidth="1.5"
        strokeDasharray="2.5 2"
        fill="none"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M7 36.5 L9 34 L11 36.5"
        stroke="#f59e0b"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
      <circle cx="9" cy="34" r="3" fill="#2dd4bf" />
      <circle cx="24" cy="18" r="3" fill="#38bdf8" />
      <circle cx="39" cy="34" r="3" fill="#2dd4bf" />
      <circle cx="9" cy="34" r="5" fill="#2dd4bf" opacity="0.12" />
      <circle cx="24" cy="18" r="5" fill="#38bdf8" opacity="0.12" />
      <circle cx="39" cy="34" r="5" fill="#2dd4bf" opacity="0.12" />
    </svg>
  );
}

export default memo(function Logo({ size = 28, showWordmark = true, className = "" }) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={size} />
      {showWordmark && (
        <span className="text-sm font-semibold tracking-tight text-white/70 font-[family-name:var(--font-heading)]">
          Commute Memory Agent
        </span>
      )}
    </div>
  );
});
