import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, Calendar, Tag, ChevronRight, X, ArrowRight, BookOpen } from "lucide-react";
import { Card, CardHeader, Avatar } from "./Primitives";

/**
 * FantasyNews - Horizontally-tiled news & trivia cards with thumbnail,
 * category badges, headlines, relative timestamps, and article detail modal.
 */
export default function FantasyNews({
  title = "Fantasy News & Facts",
  articles = [],
}) {
  const [selectedArticle, setSelectedArticle] = useState(null);

  const displayArticles = articles && Array.isArray(articles) ? articles : [];

  return (
    <>
      <Card className="p-3 sm:p-4 bg-surface/90 border border-border/70 shadow-xl backdrop-blur-md rounded-2xl">
        <CardHeader
          title={title}
          subtitle="Latest Insights & Trivia"
          className="mb-2 sm:mb-3"
          action={
            <Link
              to="/facts"
              className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />

        {displayArticles.length === 0 ? (
          <div className="py-8 text-center space-y-2 bg-background/40 rounded-xl border border-border/40">
            <BookOpen className="w-8 h-8 mx-auto text-text-muted opacity-40" />
            <p className="text-text-secondary text-xs font-semibold">No news or facts published yet</p>
            <p className="text-text-muted text-[11px]">Check back later for official league updates and trivia!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {displayArticles.map((a, idx) => (
              <div
                key={a.id || a.headline || idx}
                onClick={() => setSelectedArticle(a)}
                className="group cursor-pointer flex items-start gap-3 bg-background/60 hover:bg-background border border-border/40 hover:border-purple-500/40 transition-all rounded-xl p-3 shadow-sm min-w-0"
              >
                <Avatar
                  src={a.thumbnail}
                  alt={a.headline}
                  size={44}
                  className="rounded-xl border border-border/60 shrink-0 bg-surface"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  {a.category && (
                    <span className="inline-block px-1.5 py-0.5 rounded-md bg-purple-500/15 text-purple-400 border border-purple-500/30 text-[9px] font-bold uppercase tracking-wider">
                      {a.category}
                    </span>
                  )}
                  <p className="text-text-primary text-xs font-bold leading-snug line-clamp-2 group-hover:text-purple-400 transition-colors">
                    {a.headline}
                  </p>
                  <p className="text-text-muted text-[10px] font-semibold flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" /> {a.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Article / Fact Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-surface border border-border/80 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-background border border-border/60 text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {selectedArticle.thumbnail && (
              <img
                src={selectedArticle.thumbnail}
                alt={selectedArticle.headline}
                className="w-full h-44 object-cover rounded-xl border border-border/60"
              />
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-400 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider">
                  {selectedArticle.category || "Fact"}
                </span>
                <span className="text-text-muted text-xs font-semibold">
                  {selectedArticle.time}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-text-primary leading-snug">
                {selectedArticle.headline}
              </h2>
            </div>

            {selectedArticle.content && (
              <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap border-t border-border/40 pt-3">
                {selectedArticle.content}
              </p>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
