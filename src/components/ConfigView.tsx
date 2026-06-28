import React, { useState, useEffect } from "react";
import { 
  Key, 
  Settings, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  Info, 
  Database, 
  Sparkles, 
  Tv, 
  Instagram, 
  Lock,
  RefreshCw,
  AlertCircle
} from "lucide-react";

interface ConfigViewProps {
  user: any;
  storageType: "local" | "drive";
  setStorageType: (type: "local" | "drive") => void;
  onGoogleSignIn: () => void;
}

export default function ConfigView({ user, storageType, setStorageType, onGoogleSignIn }: ConfigViewProps) {
  // Key state values loaded from localStorage
  const [geminiKey, setGeminiKey] = useState("");
  const [youtubeKey, setYoutubeKey] = useState("");
  const [igToken, setIgToken] = useState("");

  // UI visibility states
  const [showGemini, setShowGemini] = useState(false);
  const [showYoutube, setShowYoutube] = useState(false);
  const [showIg, setShowIg] = useState(false);

  // Status variables
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load on initial render
  useEffect(() => {
    setGeminiKey(localStorage.getItem("the90s_Breeze_gemini_api_key") || "");
    setYoutubeKey(localStorage.getItem("the90s_Breeze_youtube_key") || "");
    setIgToken(localStorage.getItem("the90s_Breeze_ig_token") || "");
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (geminiKey.trim()) {
      localStorage.setItem("the90s_Breeze_gemini_api_key", geminiKey.trim());
    } else {
      localStorage.removeItem("the90s_Breeze_gemini_api_key");
    }

    if (youtubeKey.trim()) {
      localStorage.setItem("the90s_Breeze_youtube_key", youtubeKey.trim());
    } else {
      localStorage.removeItem("the90s_Breeze_youtube_key");
    }

    if (igToken.trim()) {
      localStorage.setItem("the90s_Breeze_ig_token", igToken.trim());
    } else {
      localStorage.removeItem("the90s_Breeze_ig_token");
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all configured API Keys and custom configurations?")) {
      localStorage.removeItem("the90s_Breeze_gemini_api_key");
      localStorage.removeItem("the90s_Breeze_youtube_key");
      localStorage.removeItem("the90s_Breeze_ig_token");
      setGeminiKey("");
      setYoutubeKey("");
      setIgToken("");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6" id="config-view">
      {/* Title Intro */}
      <div className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl dark:bg-slate-900 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Pipeline Key Configuration Center
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure API credentials, tokens, and storage preferences for your personal pipeline environment.
        </p>
        <div className="mt-4 p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-indigo-800 dark:text-indigo-300 leading-normal font-medium">
            <strong>Client-Side Privacy Shield:</strong> Keys configured here are saved exclusively inside your browser's local sandbox (<code className="font-mono bg-indigo-100/60 dark:bg-indigo-950 px-1 py-0.5 rounded">localStorage</code>). They are never transmitted, logged, or stored on any central server, assuring complete privacy and security.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Settings */}
        <form onSubmit={handleSave} className="lg:col-span-2 p-6 bg-white border border-slate-200 shadow-sm rounded-2xl dark:bg-slate-900 dark:border-slate-800 space-y-6">
          <h4 className="text-sm font-bold text-slate-950 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80 pb-3 flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-500" />
            API Keys & Authentication Tokens
          </h4>

          {/* Gemini API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Gemini API Key
              </label>
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                geminiKey ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800/80 dark:text-slate-400"
              }`}>
                {geminiKey ? "✓ Custom Key Configured" : "Using Default Shared Simulation"}
              </span>
            </div>
            <div className="relative">
              <input
                type={showGemini ? "text" : "password"}
                placeholder="AI Studio / Gemini API Key (AIzaSy...)"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 rounded-xl pl-3.5 pr-11 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowGemini(!showGemini)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Used to run active Trend scouting, precise lyrics retrieval, background asset generation, lofi video processing guides, and multimedia lab analyses.
            </p>
          </div>

          {/* YouTube API Key */}
          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Tv className="w-4 h-4 text-rose-500" />
                YouTube Data API v3 Key <span className="text-[9px] font-mono text-slate-400 font-semibold">(Optional)</span>
              </label>
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                youtubeKey ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800/80 dark:text-slate-400"
              }`}>
                {youtubeKey ? "✓ Configured" : "Offline Simulation / AI Grounding"}
              </span>
            </div>
            <div className="relative">
              <input
                type={showYoutube ? "text" : "password"}
                placeholder="Google Cloud Console YouTube API Key"
                value={youtubeKey}
                onChange={(e) => setYoutubeKey(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 rounded-xl pl-3.5 pr-11 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowYoutube(!showYoutube)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                {showYoutube ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Allows bypassing fallback research queries to pull video titles, descriptions, views, and duration directly from official YouTube servers.
            </p>
          </div>

          {/* Instagram / Meta Access Token */}
          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-500" />
                Instagram Meta Access Token <span className="text-[9px] font-mono text-slate-400 font-semibold">(Optional)</span>
              </label>
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                igToken ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800/80 dark:text-slate-400"
              }`}>
                {igToken ? "✓ Configured" : "Manual Export Only"}
              </span>
            </div>
            <div className="relative">
              <input
                type={showIg ? "text" : "password"}
                placeholder="EAACW..."
                value={igToken}
                onChange={(e) => setIgToken(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 rounded-xl pl-3.5 pr-11 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowIg(!showIg)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                {showIg ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Meta Graph token used to publish generated 90s Reels automatically. When missing, the queue enables a visual download exporter to publish manually.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/60">
            <button
              type="button"
              onClick={handleClearAll}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Clear All Keys
            </button>
            <div className="flex items-center gap-3">
              {saveSuccess && (
                <span className="text-emerald-500 text-xs font-mono font-bold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Keys Saved Successfully!
                </span>
              )}
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md hover:shadow-lg cursor-pointer"
              >
                Apply Config
              </button>
            </div>
          </div>
        </form>

        {/* Sidebar Status Overview */}
        <div className="space-y-6">
          {/* Environment Status Card */}
          <div className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-500" />
              Active Workspace Sync
            </h4>
            
            <div className="space-y-3.5 pt-2">
              {/* Google Drive Auth Status */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  Google Drive Authentication
                </span>
                {user ? (
                  <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 truncate">{user.displayName || "Google Account"}</p>
                      <p className="text-[9px] text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold leading-relaxed">
                      You are operating in offline simulation. Connect Google Drive to export files automatically.
                    </p>
                    <button
                      type="button"
                      onClick={onGoogleSignIn}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[9px] uppercase tracking-widest rounded-lg transition cursor-pointer"
                    >
                      Authorize Google Drive
                    </button>
                  </div>
                )}
              </div>

              {/* Default Storage Destination toggle */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  Content Save Destination
                </span>
                <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setStorageType("local")}
                    className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition cursor-pointer tracking-wider ${
                      storageType === "local"
                        ? "bg-slate-800 text-white dark:bg-slate-800 dark:text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-300"
                    }`}
                  >
                    Local Storage
                  </button>
                  <button
                    type="button"
                    onClick={() => setStorageType("drive")}
                    className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition cursor-pointer tracking-wider flex items-center justify-center gap-1 ${
                      storageType === "drive"
                        ? "bg-slate-800 text-white dark:bg-slate-800 dark:text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-300"
                    }`}
                  >
                    Google Drive
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Help Card */}
          <div className="p-5 bg-gradient-to-br from-indigo-950/20 to-slate-950/40 border border-indigo-500/10 rounded-2xl space-y-3">
            <h5 className="text-xs font-bold text-indigo-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              Need a Gemini API Key?
            </h5>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              You can obtain a 100% free developer API Key from Google AI Studio. 
            </p>
            <a
              href="https://aistudio.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline"
            >
              Get free Gemini Key →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
