"use client";

import type { MouseEventHandler, ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
};

export default function TrackedCalculationLink({ href, children, className }: Props) {
  const handleClick: MouseEventHandler<HTMLAnchorElement> = () => {
    const trackedWindow = window as typeof window & {
      ym?: (counter: number, action: string, goal: string, params?: Record<string, string>) => void;
    };

    trackedWindow.ym?.(109859892, "reachGoal", "click_calculation", {
      calculator: href,
      source: window.location.pathname,
    });
  };

  return (
    <a className={className} href={href} onClick={handleClick}>
      {children}
    </a>
  );
}
