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
      className={`h-full overflow-hidden bg-gradient-card border border-border rounded-[10px] shadow-card ${
        padded ? "p-3.5" : ""
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
    <div className={`flex items-start justify-between mb-3 ${className}`}>
      <div>
        <h3 className="text-text-primary font-semibold text-[15px] leading-tight">{title}</h3>
        {subtitle && (
          <p className="text-text-secondary text-[11px] mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/** Pill - small rounded badge, used for difficulty ratings, deadline units, etc. */
export function Pill({ children, color = "slate", className = "" }) {
  const colors = {
    slate: "bg-surface text-text-secondary",
    green: "bg-success/15 text-success",
    red: "bg-danger text-text-primary",
    orange: "bg-orange-500 text-text-primary",
    amber: "bg-warning text-text-primary",
    purple: "bg-primary/20 text-primary",
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
      className={`text-primary text-xs font-medium hover:text-primary/80 transition-colors ${className}`}
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
      className={`rounded-full overflow-hidden bg-surface flex-shrink-0 ${className}`}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-text-secondary text-xs">
          {alt?.[0] ?? "?"}
        </div>
      )}
    </div>
  );
}

/** IconCircle - circular icon badge used for team crests, stat icons, etc. */
export function IconCircle({ children, bg = "bg-surface", size = 44, className = "" }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full flex items-center justify-center flex-shrink-0 ${bg} ${className}`}
    >
      {children}
    </div>
  );
}


