import React from "react";
import { Card, CardHeader } from "./Primitives";

/**
 * YourPlayersCard - shows squad fill progress (e.g. 13/15 selected) with
 * a jersey graphic and a primary CTA button.
 */
export default function YourPlayersCard({
  selected = 13,
  total = 15,
  jerseyNumber = "11",
  ctaLabel = "View Squad",
  onCta,
}) {
  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader title="Your Players" />
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-text-primary font-bold text-xl">
            {selected}
            <span className="text-text-secondary text-base font-medium"> / {total}</span>
          </p>
          <p className="text-text-secondary text-xs mt-0.5">Selected</p>
        </div>
        <div className="w-10 h-12 rounded-md bg-gradient-to-b from-primary to-primary-dark flex items-center justify-center text-text-primary font-bold text-xs shadow-md">
          {jerseyNumber}
        </div>
      </div>

      <button
        onClick={onCta}
        className="w-full bg-surface hover:bg-surface/80 active:bg-surface/60 transition-colors text-text-primary font-semibold text-xs rounded-lg py-3 min-h-[44px]"
      >
        {ctaLabel}
      </button>
    </Card>
  );
}

