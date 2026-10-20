import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "grid" | "message" | "vault" | "scan" | "activity" | "settings" | "shield" | "lock"
  | "arrow" | "spark" | "check" | "warning" | "chevron" | "send" | "key" | "eye"
  | "terminal" | "plus" | "close" | "external" | "clock" | "refresh" | "copy";

const paths: Record<IconName, ReactNode> = {
  grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
  message: <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l-2 2v-9.5a7.5 7.5 0 0 1 7.5-7.5h2A7.5 7.5 0 0 1 20 11.5Z" /><path d="M8 11h8M8 14h5" /></>,
  vault: <><rect x="3.5" y="4" width="17" height="16" rx="2.5" /><circle cx="12" cy="12" r="4" /><path d="M12 10v4m-2-2h4" /></>,
  scan: <><path d="M8 3.5H5.5a2 2 0 0 0-2 2V8M16 3.5h2.5a2 2 0 0 1 2 2V8M21 16v2.5a2 2 0 0 1-2 2h-2.5M8 20.5H5.5a2 2 0 0 1-2-2V16" /><path d="M4 12h16" /></>,
  activity: <><path d="M3 12h4l2.5-6 5 12 2.5-6h4" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.2 1-1.5 2.6-1.5-.6a7.9 7.9 0 0 1-1.8 1l-.3 1.6h-3l-.3-1.6a7.9 7.9 0 0 1-1.8-1l-1.5.6-1.5-2.6 1.2-1A7.2 7.2 0 0 1 8.3 13l-1.5-.8v-3l1.5-.5c.2-.7.5-1.3.9-1.8L8.5 5.4 11 4l1 1.2c.6-.1 1.3-.1 2 0L15 4l2.5 1.4-.7 1.5c.4.5.7 1.1.9 1.8l1.5.5v3l-1.5.8c-.1.7-.2 1.3-.5 2Z" /></>,
  shield: <><path d="M12 3 19 6v5.3c0 4.2-2.8 7.4-7 9.7-4.2-2.3-7-5.5-7-9.7V6l7-3Z" /><path d="m9 12 2 2 4-4" /></>,
  lock: <><rect x="4.5" y="10" width="15" height="10" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3m-4 4v2" /></>,
  arrow: <><path d="M4 12h15M13 6l6 6-6 6" /></>,
  spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  warning: <><path d="M10.4 4.8 2.8 18a1.4 1.4 0 0 0 1.2 2.1h16a1.4 1.4 0 0 0 1.2-2.1L13.6 4.8a1.8 1.8 0 0 0-3.2 0Z" /><path d="M12 9v4m0 3h.01" /></>,
  chevron: <path d="m9 18 6-6-6-6" />,
  send: <><path d="m21 3-7.5 18-3.5-7-7-3.5L21 3Z" /><path d="M10 14 21 3" /></>,
  key: <><circle cx="8" cy="15" r="4" /><path d="m11 12 8-8 2 2-2 2 2 2-3 3-2-2-2 2" /></>,
  eye: <><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></>,
  terminal: <><path d="m5 7 5 5-5 5m8 0h6" /></>,
  plus: <><path d="M12 5v14m-7-7h14" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  external: <><path d="M14 4h6v6m-10 4L20 4" /><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  refresh: <><path d="M20 11a8 8 0 0 0-14-5L4 8" /><path d="M4 4v4h4M4 13a8 8 0 0 0 14 5l2-2" /><path d="M20 20v-4h-4" /></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
};

export function Icon({ name, size = 18, strokeWidth = 1.8, ...props }: SVGProps<SVGSVGElement> & { name: IconName; size?: number; strokeWidth?: number }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>{paths[name]}</svg>;
}
