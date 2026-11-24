import React from 'react';

interface TripXLogoProps {
  className?: string;
}

export const TripXLogo: React.FC<TripXLogoProps> = ({ className = 'h-7 w-7' }) => {
  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        width="512"
        height="512"
        rx="128"
        className="fill-[#1F5D6B] dark:fill-[#2B7788]"
      />
      <path
        d="M150 150L362 362M362 150L150 362"
        stroke="#F7F8FA"
        strokeWidth="44"
        strokeLinecap="round"
      />
      <circle cx="256" cy="102" r="21" fill="#F7F8FA" />
    </svg>
  );
};
