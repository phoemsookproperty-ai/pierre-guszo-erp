'use client';

export default function BrandLogo({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* "HATYAI" Text above collar */}
      <text
        x="100"
        y="25"
        fill="currentColor"
        fontSize="12"
        fontWeight="bold"
        fontFamily="Georgia, serif"
        textAnchor="middle"
        letterSpacing="2"
      >
        HATYAI
      </text>

      {/* Bow Tie */}
      <path
        d="M86 42 L97 45 L97 37 Z"
        fill="currentColor"
      />
      <path
        d="M114 42 L103 45 L103 37 Z"
        fill="currentColor"
      />
      <circle cx="100" cy="41" r="3.5" fill="currentColor" />

      {/* Tuxedo Collar & Jacket Lapels */}
      {/* Left Lapel */}
      <path
        d="M82 32 L60 52 L96 128"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right Lapel */}
      <path
        d="M118 32 L140 52 L104 128"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* PIERRE GUSZO Brand Name */}
      <text
        x="100"
        y="152"
        fill="currentColor"
        fontSize="21"
        fontWeight="bold"
        fontFamily="Times New Roman, Georgia, serif"
        textAnchor="middle"
        letterSpacing="1.5"
      >
        PIERRE GUSZO
      </text>

      {/* Est. 1987 Subtext */}
      <text
        x="52"
        y="180"
        fill="currentColor"
        fontSize="15"
        fontFamily="Times New Roman, Georgia, serif"
        textAnchor="middle"
      >
        Est.
      </text>
      
      <text
        x="148"
        y="180"
        fill="currentColor"
        fontSize="15"
        fontFamily="Times New Roman, Georgia, serif"
        textAnchor="middle"
      >
        1987
      </text>

      {/* Crossed Scissors in the bottom center */}
      {/* Left Blade */}
      <path
        d="M93 162 L107 182"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Right Blade */}
      <path
        d="M107 162 L93 182"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Left Loop Handle */}
      <circle cx="91" cy="186" r="4" stroke="currentColor" strokeWidth="2.5" />
      {/* Right Loop Handle */}
      <circle cx="109" cy="186" r="4" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}
