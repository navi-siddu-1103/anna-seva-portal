import type { SVGProps } from "react";

export function WheatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 22 16 8" />
      <path d="M10 22V8.5" />
      <path d="M16 22V8.5" />
      <path d="M22 22V8.5" />
      <path d="M16 8c2-2.5 3.5-6.5 3-8-3.5 1.5-7.5 3-9.5 5.5" />
      <path d="M10 8c2-2.5 3.5-6.5 3-8-3.5 1.5-7.5 3-9.5 5.5" />
    </svg>
  );
}
