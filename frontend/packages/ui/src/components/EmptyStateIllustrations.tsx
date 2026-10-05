"use client";

import type { SVGAttributes } from 'react';

const stopStyle = (color: string, opacity: number) => ({
  stopColor: color,
  stopOpacity: opacity,
});

export function EmptyInstances(props: SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width="120"
      height="120"
      fill="none"
      {...props}
    >
      <defs>
        <linearGradient id="grad-instances" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={stopStyle("#6366f1", 0.3)} />
          <stop offset="100%" style={stopStyle("#8b5cf6", 0.1)} />
        </linearGradient>
      </defs>
      <circle cx="60" cy="55" r="40" fill="url(#grad-instances)" stroke="#c7d2fe" strokeWidth="1.5" strokeDasharray="6 4"/>
      <g transform="translate(60, 45)">
        <path d="M-15 15 L-15 -15 L15 -15 L15 15 Z" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M-15 15 L-10 10" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
        <path d="M15 15 L10 10" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="0" cy="-5" r="6" fill="none" stroke="#6366f1" strokeWidth="1.5"/>
        <path d="M-8 2 L-2 8 L8 -4" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <text x="60" y="105" textAnchor="middle" fontSize="10" fill="#9ca3af" fontFamily="system-ui, sans-serif" fontWeight="500">No instances yet</text>
    </svg>
  );
}

export function EmptySshKeys(props: SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width="120"
      height="120"
      fill="none"
      {...props}
    >
      <defs>
        <linearGradient id="grad-ssh" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={stopStyle("#f59e0b", 0.3)} />
          <stop offset="100%" style={stopStyle("#f97316", 0.1)} />
        </linearGradient>
      </defs>
      <circle cx="60" cy="55" r="40" fill="url(#grad-ssh)" stroke="#fde68a" strokeWidth="1.5" strokeDasharray="6 4"/>
      <g transform="translate(60, 45)">
        <path d="M8 2 C11.3 2 14 4.7 14 8 C14 11.3 11.3 14 8 14 C4.7 14 2 11.3 2 8 C2 4.7 4.7 2 8 2 Z" fill="none" stroke="#f59e0b" strokeWidth="2"/>
        <circle cx="8" cy="8" r="3" fill="none" stroke="#f59e0b" strokeWidth="1.5"/>
        <rect x="8" y="5" width="14" height="6" rx="1" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
        <path d="M-2 0 L-2 16" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4 4"/>
        <path d="M0 -2 L16 -2" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4 4"/>
      </g>
      <text x="60" y="105" textAnchor="middle" fontSize="10" fill="#9ca3af" fontFamily="system-ui, sans-serif" fontWeight="500">No SSH keys yet</text>
    </svg>
  );
}

export function EmptyGeneric(props: SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width="120"
      height="120"
      fill="none"
      {...props}
    >
      <defs>
        <linearGradient id="grad-generic" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={stopStyle("#6b7280", 0.3)} />
          <stop offset="100%" style={stopStyle("#9ca3af", 0.1)} />
        </linearGradient>
      </defs>
      <circle cx="60" cy="55" r="40" fill="url(#grad-generic)" stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="6 4"/>
      <g transform="translate(60, 45)">
        <path d="M20 0 L20 20 L-20 20 L-20 -20 L20 -20 L20 0" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M0 -15 L0 5" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
        <path d="M-10 0 L10 0" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="0" cy="0" r="3" fill="#9ca3af"/>
      </g>
      <text x="60" y="105" textAnchor="middle" fontSize="10" fill="#9ca3af" fontFamily="system-ui, sans-serif" fontWeight="500">Nothing here yet</text>
    </svg>
  );
}