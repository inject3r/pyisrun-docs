"use client";

import { useId } from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-14 h-14",
};

export default function Logo({ size = "md", className = "" }: LogoProps) {
  const uid = useId();
  const bgId = `pylsBg-${uid}`;
  const dieId = `pylsDie-${uid}`;
  const traceGradId = `pylsTrace-${uid}`;
  const busGradId = `pylsBus-${uid}`;
  const nodeGlowId = `pylsNodeGlow-${uid}`;
  const pulseGlowId = `pylsPulseGlow-${uid}`;
  const glowFilterId = `pylsGlow-${uid}`;

  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <defs>
          <radialGradient id={bgId} cx="30%" cy="20%" r="95%">
            <stop offset="0" stopColor="#1a1f26" />
            <stop offset="0.55" stopColor="#0e1116" />
            <stop offset="1" stopColor="#08090b" />
          </radialGradient>

          <linearGradient
            id={dieId}
            x1="20"
            y1="20"
            x2="80"
            y2="80"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#171b21" />
            <stop offset="1" stopColor="#0b0d10" />
          </linearGradient>

          <linearGradient
            id={traceGradId}
            x1="15"
            y1="50"
            x2="85"
            y2="50"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#FFB454" />
            <stop offset="0.5" stopColor="#FFC978" />
            <stop offset="1" stopColor="#7EE787" />
          </linearGradient>

          <linearGradient
            id={busGradId}
            x1="20"
            y1="0"
            x2="80"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.02" />
            <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.09" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.02" />
          </linearGradient>

          <radialGradient id={nodeGlowId} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#7EE787" stopOpacity="0.9" />
            <stop offset="0.5" stopColor="#7EE787" stopOpacity="0.3" />
            <stop offset="1" stopColor="#7EE787" stopOpacity="0" />
          </radialGradient>

          <radialGradient id={pulseGlowId} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#FFB454" stopOpacity="0.95" />
            <stop offset="1" stopColor="#FFB454" stopOpacity="0" />
          </radialGradient>

          <filter
            id={glowFilterId}
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
          >
            <feGaussianBlur stdDeviation="1.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="100" height="100" rx="22" fill={`url(#${bgId})`} />
        <rect
          x="1.5"
          y="1.5"
          width="97"
          height="97"
          rx="21"
          stroke="#FFFFFF"
          strokeOpacity="0.07"
          strokeWidth="1.2"
          fill="none"
        />

        <line
          x1="24"
          y1="4"
          x2="24"
          y2="14"
          stroke="#FFFFFF"
          strokeOpacity="0.16"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="36"
          y1="4"
          x2="36"
          y2="14"
          stroke="#FFFFFF"
          strokeOpacity="0.16"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="48"
          y1="4"
          x2="48"
          y2="14"
          stroke="#FFFFFF"
          strokeOpacity="0.16"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="60"
          y1="4"
          x2="60"
          y2="14"
          stroke="#FFFFFF"
          strokeOpacity="0.16"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="72"
          y1="4"
          x2="72"
          y2="14"
          stroke="#FFFFFF"
          strokeOpacity="0.16"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="24"
          y1="86"
          x2="24"
          y2="96"
          stroke="#FFFFFF"
          strokeOpacity="0.16"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="36"
          y1="86"
          x2="36"
          y2="96"
          stroke="#FFFFFF"
          strokeOpacity="0.16"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="48"
          y1="86"
          x2="48"
          y2="96"
          stroke="#FFFFFF"
          strokeOpacity="0.16"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="60"
          y1="86"
          x2="60"
          y2="96"
          stroke="#FFFFFF"
          strokeOpacity="0.16"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="72"
          y1="86"
          x2="72"
          y2="96"
          stroke="#FFFFFF"
          strokeOpacity="0.16"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="4"
          y1="24"
          x2="14"
          y2="24"
          stroke="#FFFFFF"
          strokeOpacity="0.16"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="4"
          y1="36"
          x2="14"
          y2="36"
          stroke="#FFFFFF"
          strokeOpacity="0.16"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="4"
          y1="48"
          x2="14"
          y2="48"
          stroke="#FFFFFF"
          strokeOpacity="0.16"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="4"
          y1="60"
          x2="14"
          y2="60"
          stroke="#FFFFFF"
          strokeOpacity="0.16"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="4"
          y1="72"
          x2="14"
          y2="72"
          stroke="#FFFFFF"
          strokeOpacity="0.16"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="86"
          y1="24"
          x2="96"
          y2="24"
          stroke="#FFFFFF"
          strokeOpacity="0.16"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="86"
          y1="36"
          x2="96"
          y2="36"
          stroke="#FFFFFF"
          strokeOpacity="0.16"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="86"
          y1="48"
          x2="96"
          y2="48"
          stroke="#FFFFFF"
          strokeOpacity="0.16"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="86"
          y1="60"
          x2="96"
          y2="60"
          stroke="#FFFFFF"
          strokeOpacity="0.16"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="86"
          y1="72"
          x2="96"
          y2="72"
          stroke="#FFFFFF"
          strokeOpacity="0.16"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        <rect
          x="16"
          y="16"
          width="68"
          height="68"
          rx="8"
          fill={`url(#${dieId})`}
          stroke="#2a3138"
          strokeOpacity="0.8"
          strokeWidth="1"
        />

        <rect
          x="17.5"
          y="17.5"
          width="65"
          height="65"
          rx="6.5"
          stroke="#FFFFFF"
          strokeOpacity="0.05"
          strokeWidth="1"
          fill="none"
        />

        <line
          x1="20"
          y1="32"
          x2="80"
          y2="32"
          stroke={`url(#${busGradId})`}
          strokeWidth="1"
        />
        <line
          x1="20"
          y1="42"
          x2="80"
          y2="42"
          stroke={`url(#${busGradId})`}
          strokeWidth="1"
        />
        <line
          x1="20"
          y1="52"
          x2="80"
          y2="52"
          stroke={`url(#${busGradId})`}
          strokeWidth="1"
        />
        <line
          x1="20"
          y1="62"
          x2="80"
          y2="62"
          stroke={`url(#${busGradId})`}
          strokeWidth="1"
        />
        <line
          x1="20"
          y1="72"
          x2="80"
          y2="72"
          stroke={`url(#${busGradId})`}
          strokeWidth="1"
        />

        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 6 }).map((_, col) => (
            <rect
              key={`${row}-${col}`}
              x={23 + col * 9.5}
              y={28 + row * 10}
              width="4"
              height="6"
              rx="0.8"
              fill="#FFFFFF"
              fillOpacity="0.04"
              stroke="#FFFFFF"
              strokeOpacity="0.08"
              strokeWidth="0.5"
            />
          )),
        )}

        <path
          d="M 16 50 L 30 50 L 34 50 L 40 34 L 46 66 L 52 42 L 58 58 L 62 50 L 84 50"
          stroke={`url(#${traceGradId})`}
          strokeWidth="2.4"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
          filter={`url(#${glowFilterId})`}
        />

        <path
          d="M 16 50 L 30 50 L 34 50 L 40 34 L 46 66 L 52 42 L 58 58 L 62 50 L 84 50"
          stroke="#F4F5F8"
          strokeOpacity="0.38"
          strokeWidth="0.7"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />

        <circle cx="62" cy="50" r="6" fill={`url(#${nodeGlowId})`} />
        <circle cx="62" cy="50" r="2.2" fill="#7EE787" />
        <circle cx="62" cy="50" r="0.9" fill="#F4F5F8" />

        <circle cx="40" cy="34" r="5.5" fill={`url(#${pulseGlowId})`} />
        <circle cx="40" cy="34" r="1.8" fill="#FFB454" />
        <circle cx="40" cy="34" r="0.8" fill="#F4F5F8" />

        <circle cx="16" cy="50" r="1.8" fill="#FFB454" fillOpacity="0.75" />
        <circle cx="84" cy="50" r="1.8" fill="#7EE787" fillOpacity="0.85" />
      </svg>
    </div>
  );
}
