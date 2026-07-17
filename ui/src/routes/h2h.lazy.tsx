import { createLazyFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "./ProtectedRoute";
import { Zap, AlertCircle } from "lucide-react";

const H2HPage = () => {
  return (
    <div className="flex flex-col flex-1 min-h-0 h-full bg-background text-white p-6 justify-center items-center font-outfit select-none">
      <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 text-center shadow-card relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full bg-violet-600/10 blur-2xl pointer-events-none" />
        
        <div className="w-14 h-14 bg-violet-600/10 border border-violet-500/25 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
          <Zap className="w-7 h-7 text-violet-400" />
        </div>
 
        <h1 className="text-xl font-black tracking-tight mb-2">Head to Head Matches</h1>
        <p className="text-xs text-text-muted leading-relaxed mb-6">
          WPL Head-to-Head standings, leagues, and matchups will populate here as drivers compete. Dynamic updates will be calculated at the end of the next Gameweek.
        </p>
 
        <div className="flex items-center justify-center gap-2 text-[10px] uppercase font-black tracking-wider text-warning bg-warning/10 border border-warning/20 rounded-xl px-4 py-2">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Feature Coming Soon</span>
        </div>
      </div>
    </div>
  );
};

export const Route = createLazyFileRoute("/h2h")({
  component: () => (
    <ProtectedRoute>
      <H2HPage />
    </ProtectedRoute>
  ),
});
