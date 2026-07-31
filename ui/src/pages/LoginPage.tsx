import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import DarkLogo from "../assets/wplf1-dark.png";
import LightLogo from "../assets/wplf1-light.png";
import { useLogin } from "../features/auth/hooks";
import { GoogleLogin } from "@react-oauth/google";
import { Trophy, Zap, ShieldCheck, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { useUserStore } from "../store/useUserStore";
import { QUERY_KEYS } from "../api/endpoints";

const LoginPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useUserStore((state) => state.setUser);
  const setGuest = useUserStore((state) => state.setGuest);

  const mutation = useLogin((data) => {
    if (data?.token) {
      localStorage.setItem("token", data.token);
    }
    if (data?.user?.username) {
      setUser({ teamName: data.user.username });
    } else {
      setGuest(false);
    }
    queryClient.resetQueries({ queryKey: [QUERY_KEYS.AUTH] });
    navigate({ to: "/home" });
  });

  const handleGoogleSuccess = (credentialResponse: any) => {
    mutation.mutate({
      credential: credentialResponse.credential,
    });
  };

  const handleGoogleError = () => {
    console.error("Google Login Failed");
  };

  const handleGuestAccess = () => {
    setGuest(true);
    navigate({ to: "/standings" });
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-[#080612] text-white p-4 sm:p-6 font-outfit select-none">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 sm:w-96 sm:h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 sm:w-96 sm:h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Background Dots Pattern */}
      <div className="absolute inset-0 bg-dots opacity-30 pointer-events-none" />

      {/* Main Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-md bg-[#120C22]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.65)] flex flex-col items-center animate-fade-in">
        
        {/* Brand Badge & Logo */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-600/40 via-indigo-500/40 to-purple-400/40 blur-md animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-[#17112A] border border-purple-500/30 flex items-center justify-center p-3 shadow-2xl transition-transform duration-300 hover:scale-105">
            <img
              src={DarkLogo}
              alt="WPL Logo"
              className="hidden dark:block w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
            />
            <img
              src={LightLogo}
              alt="WPL Logo"
              className="block dark:hidden w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
            />
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[11px] font-semibold text-purple-300 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Official Fantasy League</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
            WPL Fantasy League
          </h1>
          <p className="text-xs sm:text-sm text-[#8B87A6] max-w-xs leading-relaxed">
            Build your dream squad, track live match stats, and dominate the leaderboard!
          </p>
        </div>

        {/* Feature Highlights Pills */}
        <div className="w-full flex items-center justify-center gap-2 flex-wrap mb-6">
          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1 text-[11px] font-medium text-purple-200/90 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Live Points</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1 text-[11px] font-medium text-purple-200/90 shadow-sm">
            <Trophy className="w-3.5 h-3.5 text-purple-400" />
            <span>Leaderboards</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1 text-[11px] font-medium text-purple-200/90 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Squad Manager</span>
          </div>
        </div>

        {/* Error Alert Box */}
        {mutation.isError && (
          <div className="w-full max-w-[340px] bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl p-3 flex items-center gap-2.5 text-xs font-medium mb-5 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>
              {mutation?.error?.data?.error || "Google login failed. Please try again."}
            </span>
          </div>
        )}

        {/* Divider / Action Header */}
        <div className="w-full max-w-[340px] relative flex items-center justify-center my-3">
          <div className="w-full border-t border-white/10" />
          <span className="absolute bg-[#120C22] px-3 text-[10px] text-[#8B87A6] font-bold tracking-widest uppercase">
            Sign In Options
          </span>
        </div>

        {/* Google OAuth Login Button Container */}
        <div className="w-full max-w-[340px] flex flex-col items-center mt-3">
          {mutation.isPending ? (
            <div className="w-full h-11 flex items-center justify-center gap-2 rounded-full bg-purple-600/20 border border-purple-500/30 text-xs font-semibold text-purple-300">
              <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              <span>Authenticating...</span>
            </div>
          ) : (
            <div className="w-full flex justify-center overflow-hidden rounded-full shadow-md transition-all hover:scale-[1.01]">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="outline"
                shape="pill"
                size="large"
                text="continue_with"
                width="340"
              />
            </div>
          )}
        </div>

        {/* Guest Skip Action */}
        <div className="w-full max-w-[340px] mt-3">
          <button
            type="button"
            onClick={handleGuestAccess}
            className="group w-full h-11 flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-purple-500/40 text-xs sm:text-sm font-semibold text-[#D8D5E8] hover:text-white transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <span>Explore League as Guest</span>
            <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-7 text-center text-[11px] text-[#8B87A6]/70 leading-normal">
          By continuing, you agree to the WPL Fantasy Terms & League Guidelines.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
