"use client";

import { useId, type SVGProps } from "react";

const wordmarkGradientClass =
  "bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-700 bg-clip-text text-transparent";

type MarkProps = Omit<SVGProps<SVGSVGElement>, "viewBox"> & {
  /** View box is 40×40; scales with width/height or className (e.g. h-9 w-9). */
  size?: number;
  /** When true, hide from assistive tech (use beside {@link ToolflowWordmark}). */
  decorative?: boolean;
};

/**
 * Squircle mark with gradient and three diamond “flow” marks (ToolFlow brand).
 */
export function ToolflowLogoMark({
  size = 40,
  className,
  decorative = false,
  ...props
}: MarkProps) {
  const uid = useId().replace(/:/g, "");
  const gid = `${uid}-tf-grad`;
  const fid = `${uid}-tf-shadow`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : "ToolFlow"}
      {...props}
    >
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        <filter id={fid} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000" floodOpacity="0.16" />
        </filter>
      </defs>
      <rect width="40" height="40" rx="12" fill={`url(#${gid})`} filter={`url(#${fid})`} />
      <g fill="#fff" fillOpacity={0.92}>
        <path d="M10.5 20 14 15.5 17.5 20 14 24.5Z" />
        <path d="M16.25 20 20 15.75 23.75 20 20 24.25Z" />
        <path d="M22.5 20 26 15.5 29.5 20 26 24.5Z" />
      </g>
    </svg>
  );
}

export function ToolflowWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-semibold tracking-tight ${wordmarkGradientClass} ${className}`}>
      ToolFlow
    </span>
  );
}
