import { createLazyFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import apiClient from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import { Sparkles, ArrowLeft, X, BookOpen, Clock, RefreshCw, ShieldAlert } from "lucide-react";

export const Route = createLazyFileRoute("/facts")({
  component: PublicFactsPage,
});

interface FactArticle {
  id: string;
  headline: string;
  content?: string;
  category: string;
  thumbnail?: string | null;
  time: string;
  createdAt?: string;
}

function PublicFactsPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<FactArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<FactArticle | null>(null);

  const fetchFacts = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await apiClient.get(API_ENDPOINTS.MANAGER.FACTS);
      setArticles(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch facts:", err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFacts();
  }, []);

  return (
    <div className="flex flex-col w-full flex-1 h-full min-h-0 bg-background text-text-primary font-outfit select-none overflow-hidden animate-fade-in pb-[env(safe-area-inset-bottom)]">
      {/* STICKY FULL-WIDTH FIXED HEADER */}
      <div className="shrink-0 border-b border-border bg-surface shadow-sm sticky top-0 z-30 w-full">
        <header className="flex items-center gap-2.5 px-3 sm:px-4 py-2.5 max-w-2xl mx-auto w-full">
          <button
            onClick={() => router.history.back()}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-background hover:bg-white/5 border border-border text-text-primary active:scale-95 transition-all cursor-pointer shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 text-text-muted" />
          </button>

          <div className="w-9 h-9 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xs sm:text-sm font-black tracking-tight text-text-primary truncate">
              Facts & News
            </h1>
            <p className="text-[10px] text-text-muted font-medium mt-0.5 truncate">
              Official league trivia and insights
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 border border-primary/40 text-secondary font-mono">
              {articles.length} total
            </span>
          </div>
        </header>
      </div>

      <div className="max-w-2xl mx-auto w-full flex flex-col flex-1 min-h-0 px-3 sm:px-4 py-3">
        {/* Scrollable Articles List */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide space-y-3 pb-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-24 bg-surface border border-border rounded-2xl skeleton-pulse stagger-${Math.min(i + 1, 5)}`}
                />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 bg-surface border border-border rounded-2xl text-center">
              <div className="w-14 h-14 rounded-full bg-danger/10 border border-danger/20 flex items-center justify-center mb-3">
                <ShieldAlert className="w-7 h-7 text-danger-bright" />
              </div>
              <p className="text-sm font-bold text-text-primary">Couldn't load facts & news</p>
              <p className="text-xs text-text-muted mt-1 mb-4">
                Something went wrong while fetching league trivia.
              </p>
              <button
                onClick={fetchFacts}
                className="px-4 py-2 rounded-lg bg-primary/15 border border-primary/40 text-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-primary/25 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          ) : articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-surface border border-border rounded-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-text-muted/50" />
              </div>
              <p className="text-base font-bold text-text-primary">No facts found</p>
              <p className="text-sm text-text-muted mt-1">When facts or news are published, they'll show up here.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {articles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="group cursor-pointer bg-surface border border-border hover:border-primary/40 transition-all rounded-2xl p-4 shadow-card flex items-start gap-3.5 active:scale-[0.995]"
                >
                  {article.thumbnail ? (
                    <img
                      src={article.thumbnail}
                      alt={article.headline}
                      className="w-14 h-14 rounded-xl object-cover border border-border shrink-0 bg-background"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-secondary shrink-0">
                      <Sparkles className="w-6 h-6" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-primary/15 text-secondary border border-primary/30 text-[10px] font-black uppercase tracking-wider">
                        {article.category}
                      </span>
                      <span className="text-text-muted text-[10px] font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-text-muted" /> {article.time}
                      </span>
                    </div>

                    <h3 className="text-text-primary font-bold text-sm leading-snug group-hover:text-secondary transition-colors line-clamp-2">
                      {article.headline}
                    </h3>

                    {article.content && (
                      <p className="text-text-muted text-xs line-clamp-2 leading-relaxed">
                        {article.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-surface border border-border rounded-3xl p-5 sm:p-6 shadow-card space-y-4 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-background border border-border text-text-muted hover:text-text-primary transition-colors z-10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {selectedArticle.thumbnail && (
              <img
                src={selectedArticle.thumbnail}
                alt={selectedArticle.headline}
                className="w-full h-48 sm:h-56 object-cover rounded-2xl border border-border"
              />
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-secondary border border-primary/30 text-[10px] font-black uppercase tracking-wider">
                  {selectedArticle.category || "Fact"}
                </span>
                <span className="text-text-muted text-xs font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {selectedArticle.time}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-text-primary leading-snug">
                {selectedArticle.headline}
              </h2>
            </div>

            {selectedArticle.content && (
              <p className="text-text-muted text-xs sm:text-sm leading-relaxed whitespace-pre-wrap border-t border-border/40 pt-3">
                {selectedArticle.content}
              </p>
            )}

            <div className="flex justify-end pt-3 border-t border-border/40">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2.5 rounded-xl bg-gradient-button text-white font-bold text-xs shadow-md cursor-pointer active:scale-95 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
