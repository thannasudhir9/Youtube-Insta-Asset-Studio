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
  AlertCircle,
  Clock,
  Star,
  Trash2,
  ShieldAlert
} from "lucide-react";
import { useToast } from "./ToastContext";
import { getAssetsFromOfflineDB } from "../lib/indexedDb";
import { performAutoCleanup } from "../lib/cleanupUtils";

interface ConfigViewProps {
  user: any;
  storageType: "local" | "drive";
  setStorageType: (type: "local" | "drive") => void;
  onGoogleSignIn: () => void;
}

export default function ConfigView({ user, storageType, setStorageType, onGoogleSignIn }: ConfigViewProps) {
  const toast = useToast();

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

  // Auto-Cleanup States
  const [autoCleanupEnabled, setAutoCleanupEnabled] = useState(false);
  const [lastCleanup, setLastCleanup] = useState("");
  const [localAssetsCount, setLocalAssetsCount] = useState(0);
  const [curatedAssetsCount, setCuratedAssetsCount] = useState(0);
  const [isRunningCleanup, setIsRunningCleanup] = useState(false);

  // Load on initial render
  useEffect(() => {
    setGeminiKey(localStorage.getItem("the90s_Breeze_gemini_api_key") || "");
    setYoutubeKey(localStorage.getItem("the90s_Breeze_youtube_key") || "");
    setIgToken(localStorage.getItem("the90s_Breeze_ig_token") || "");

    // Auto-Cleanup config
    setAutoCleanupEnabled(localStorage.getItem("the90s_Breeze_auto_cleanup_enabled") === "true");
    setLastCleanup(localStorage.getItem("the90s_Breeze_last_cleanup") || "");

    // Load local offline assets statistics
    getAssetsFromOfflineDB().then(assets => {
      setLocalAssetsCount(assets.length);
      setCuratedAssetsCount(assets.filter(a => a.isCurated).length);
    }).catch(err => {
      console.error("Failed to load assets stats in ConfigView", err);
    });
  }, []);

  const handleToggleAutoCleanup = (enabled: boolean) => {
    setAutoCleanupEnabled(enabled);
    localStorage.setItem("the90s_Breeze_auto_cleanup_enabled", String(enabled));
    toast.success(`Auto-Cleanup ${enabled ? "enabled" : "disabled"} successfully!`);
  };

  const handleRunCleanupNow = async () => {
    setIsRunningCleanup(true);
    try {
      const results = await performAutoCleanup();
      const updatedAssets = await getAssetsFromOfflineDB();
      setLocalAssetsCount(updatedAssets.length);
      setCuratedAssetsCount(updatedAssets.filter(a => a.isCurated).length);
      const nowStr = new Date().toISOString();
      setLastCleanup(nowStr);
      
      if (results.deletedCount > 0) {
        toast.success(`Cleared ${results.deletedCount} temporary local assets older than 30 days. Kept ${results.keptCount} active clips!`);
      } else {
        toast.info(`No temporary cache files older than 30 days were found. Preserved all ${results.keptCount} clips!`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Cleanup process encountered an error.");
    } finally {
      setIsRunningCleanup(false);
    }
  };

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
    toast.success("API Configuration Updated! Settings saved to secure browser storage.");
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
      toast.success("API Configuration Updated! All credential configurations cleared.");
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

          {/* Space & Cache Auto-Cleanup */}
          <div className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-rose-500" />
              Storage & Cache Optimization
            </h4>

            <div className="space-y-4">
              {/* Toggle option */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Auto-Cleanup Files</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                    Automatically clear temporary local offline assets older than 30 days.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleAutoCleanup(!autoCleanupEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none shrink-0 ${
                    autoCleanupEnabled ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-800"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform shadow-xs ${
                      autoCleanupEnabled ? "transform translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Status information */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-2 text-[10px] text-slate-500 dark:text-slate-400">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <Database className="w-3 h-3 text-slate-400" />
                    Total Saved Assets:
                  </span>
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">{localAssetsCount} clips</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500/10" />
                    Curated Viral Hooks:
                  </span>
                  <strong className="text-amber-600 dark:text-amber-400 font-mono">{curatedAssetsCount} kept</strong>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Last Active Cleanup:
                  </span>
                  <span className="font-mono text-[9px] text-slate-600 dark:text-slate-400">
                    {lastCleanup ? new Date(lastCleanup).toLocaleDateString() : "Never Run"}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleRunCleanupNow}
                disabled={isRunningCleanup}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 disabled:opacity-50 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isRunningCleanup ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Optimizing cache...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3" />
                    Run Cleanup Now
                  </>
                )}
              </button>

              <div className="p-2.5 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/40 dark:border-amber-900/20 rounded-xl flex items-start gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[9px] text-amber-800 dark:text-amber-400 leading-normal">
                  Auto-Cleanup strictly preserves all synced Google Drive clips and any local clips with the <span className="font-bold text-amber-600 dark:text-amber-400">★ Curated</span> status.
                </p>
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
