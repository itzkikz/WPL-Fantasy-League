import React from "react";
import { Card, CardHeader, LinkText, Avatar } from "./Primitives";

/**
 * FantasyNews - horizontally-tiled news/article cards with thumbnail,
 * headline and relative timestamp.
 */
export default function FantasyNews({
  title = "Fantasy News",
  articles = [
    {
      thumbnail: null,
      headline: "Haaland hat-trick fires Man City to big win",
      time: "2h ago",
    },
    {
      thumbnail: null,
      headline: "Injury Update: Saka doubtful for GW16",
      time: "5h ago",
    },
    {
      thumbnail: null,
      headline: "Top 5 differential picks for Gameweek 16",
      time: "1d ago",
    },
  ],
  onViewAll,
}) {
  return (
    <Card>
      <CardHeader
        title={title}
        action={
              <LinkText>
            <button onClick={onViewAll} className="hover:underline active:opacity-70">
              View All
            </button>
          </LinkText>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {articles.map((a) => (
          <a
            key={a.headline}
            href="#"
            className="flex gap-3 bg-surface hover:bg-surface/80 active:bg-surface/60 transition-colors rounded-lg p-3"
          >
            <Avatar src={a.thumbnail} alt={a.headline} size={48} className="rounded-lg" />
            <div className="min-w-0">
              <p className="text-text-primary text-xs font-medium leading-snug line-clamp-2">
                {a.headline}
              </p>
              <p className="text-text-secondary text-xs mt-1">{a.time}</p>
            </div>
          </a>
        ))}
      </div>
    </Card>
  );
}

