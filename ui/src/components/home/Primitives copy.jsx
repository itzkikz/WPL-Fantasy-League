import React from "react";

/**
 * Card - base container used by every panel on the dashboard.
 * Keeps the dark, rounded, subtly-bordered look consistent everywhere.
 */
export function Card({
  children,
  className = "",
  padded = true,
  as: Tag = "div",
  ...props
}) {
  return (
    <Tag
      className={`bg-[#181229] border border-white/5 rounded-2xl ${
        padded ? "p-5" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

/** CardHeader - title + optional eyebrow/subtitle + optional right-aligned action */
export function CardHeader({ title, subtitle, action, className = "" }) {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      <div>
        <h3 className="text-white font-semibold text-[15px]">{title}</h3>
        {subtitle && (
          <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/** Pill - small rounded badge, used for difficulty ratings, deadline units, etc. */
export function Pill({ children, color = "slate", className = "" }) {
  const colors = {
    slate: "bg-white/10 text-slate-200",
    green: "bg-emerald-500/15 text-emerald-400",
    red: "bg-rose-500 text-white",
    orange: "bg-orange-500 text-white",
    amber: "bg-amber-500 text-white",
    purple: "bg-indigo-500/20 text-indigo-300",
  };
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md text-xs font-semibold px-2.5 py-1 ${colors[color]} ${className}`}
    >
      {children}
    </span>
  );
}

/** LinkText - the small purple "View All" style link */
export function LinkText({ children, href = "#", className = "" }) {
  return (
    <a
      href={href}
      className={`text-indigo-400 text-sm font-medium hover:text-indigo-300 transition-colors ${className}`}
    >
      {children}
    </a>
  );
}

/** Avatar - circular player photo with graceful fallback */
export function Avatar({ src, alt, size = 40, className = "" }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full overflow-hidden bg-white/10 flex-shrink-0 ${className}`}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
          {alt?.[0] ?? "?"}
        </div>
      )}
    </div>
  );
}

/** IconCircle - circular icon badge used for team crests, stat icons, etc. */
export function IconCircle({ children, bg = "bg-white/10", size = 44, className = "" }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full flex items-center justify-center flex-shrink-0 ${bg} ${className}`}
    >
      {children}
    </div>
  );
}
