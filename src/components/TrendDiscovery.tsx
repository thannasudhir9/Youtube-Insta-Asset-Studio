import React, { useState } from "react";
import { 
  Sparkles, 
  Flame, 
  Search, 
  Music, 
  Film, 
  Clock, 
  Compass, 
  Tv, 
  TrendingUp, 
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { TrendItem } from "../types";

interface TrendDiscoveryProps {
  onSelectSong: (song: TrendItem, language: string) => void;
}

export default function TrendDiscovery({ onSelectSong }: TrendDiscoveryProps) {
  const [language, setLanguage] = useState<string>("telugu");
  const [customQuery, setCustomQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [scoutedLanguage, setScoutedLanguage] = useState<string>("");

  const scoutTrends = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/gemini/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, query: customQuery }),
      });
      const data = await response.json();
      setTrends(data.trends || []);
      setScoutedLanguage(language);
    } catch (error) {
      console.error("Failed to scout trends:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pre-load default trends on startup so it's not empty
  React.useEffect(() => {
    scoutTrends();
  }, [language]);

  const languages = [
    { id: "telugu", name: "Telugu", color: "from-orange-500 to-red-600" },
    { id: "telugufolk", name: "Telugu Folk", color: "from-amber-500 to-orange-600" },
    { id: "tamil", name: "Tamil", color: "from-blue-500 to-indigo-600" },
    { id: "hindi", name: "Hindi", color: "from-pink-500 to-rose-600" },
    { id: "malayalam", name: "Malayalam", color: "from-emerald-500 to-teal-600" },
    { id: "kannada", name: "Kannada", color: "from-yellow-500 to-amber-600" },
    { id: "punjabi", name: "Punjabi", color: "from-red-500 to-orange-600" },
    { id: "southindia", name: "South India Hits", color: "from-cyan-500 to-blue-600" },
    { id: "northindia", name: "North India Hits", color: "from-purple-500 to-indigo-600" },
    { id: "regional", name: "Regional Songs", color: "from-lime-500 to-emerald-600" }
  ];

  return (
    <div className="space-y-6" id="trend-discovery">
      {/* Search Bar / Controls */}
      <div className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600" />
            Regional Nostalgia Trend Scout
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Toggle language filters or enter specific keywords to trigger Gemini's nostalgic query-grounding model to analyze viral hits.
          </p>
        </div>

        {/* Language Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id)}
              className={`p-3 rounded-xl border text-sm font-semibold transition text-center relative overflow-hidden ${
                language === lang.id
                  ? "bg-indigo-50 border-indigo-200 text-indigo-950 shadow-sm"
                  : "bg-slate-50/50 border-slate-100 text-slate-500 hover:border-slate-200 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${lang.color}`} />
                {lang.name}
              </div>
              {language === lang.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
              )}
            </button>
          ))}
        </div>

        {/* Custom Context Query Input */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="E.g., Sad emotional songs, Rainy atmosphere, SPB Solos, Kumar Sanu melodious duets..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500/80 focus:bg-white transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
          <button
            onClick={scoutTrends}
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400/40 disabled:text-slate-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition shrink-0 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Scouting Web Archive...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Scout Trends with Gemini
              </>
            )}
          </button>
        </div>
      </div>

      {/* Discovered Trends Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-rose-500" />
            Top 3 Curated Evergreen Tracks ({scoutedLanguage.toUpperCase()})
          </h4>
          <span className="text-[10px] font-mono text-slate-400">
            Click 'Select' to synthesize a Reels video
          </span>
        </div>

        {loading ? (
          <div className="p-12 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-4 text-center shadow-sm">
            <div className="p-4 bg-indigo-50 rounded-full border border-indigo-100 animate-pulse">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Analyzing search metrics and YouTube archives...</p>
              <p className="text-xs text-slate-400 mt-1">Isolating highly viral 90s audio tracks and background aesthetic suggestions...</p>
            </div>
          </div>
        ) : trends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trends.map((song, index) => (
              <div 
                key={index}
                className="group relative flex flex-col justify-between p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-indigo-300 hover:shadow-md transition duration-300 overflow-hidden text-slate-900"
              >
                {/* Background decorative cassette reel glow */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/5 rounded-full group-hover:bg-indigo-500/10 transition-colors duration-300 blur-2xl" />

                <div className="space-y-4">
                  {/* Song Title and Year Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 flex items-center justify-center bg-indigo-50 border border-indigo-100 text-[10px] font-mono text-indigo-700 font-bold rounded-lg shrink-0">
                        0{index + 1}
                      </span>
                      <span className="px-2 py-0.5 text-[9px] font-mono font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded">
                        {song.year} Classic
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      {song.views} views
                    </span>
                  </div>

                  {/* Song Details */}
                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                      {song.title}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-slate-400" />
                      Movie: <strong className="text-slate-700 font-semibold">{song.movie}</strong>
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-slate-400" />
                      Singers: <span className="text-slate-700 truncate">{song.singers}</span>
                    </p>
                  </div>

                  {/* Curated Recommendations */}
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-600 uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5" />
                      Viral Hook Loop
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-800 font-semibold">{song.hookTime}</span>
                      <span className="text-slate-400 text-[10px]">(30s cut)</span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-100">
                      <div className="text-[9px] font-mono text-slate-400 uppercase">Recommended Backdrop:</div>
                      <p className="text-xs text-slate-600 font-sans mt-0.5 leading-snug">{song.vibes}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onSelectSong(song, scoutedLanguage)}
                    className="w-full py-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-xs font-bold text-slate-800 hover:text-indigo-900 rounded-xl flex items-center justify-center gap-2 group/btn transition cursor-pointer"
                  >
                    Select for Video Studio
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-600 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 bg-white border border-slate-200 rounded-2xl text-center text-slate-400 text-xs shadow-sm">
            No trending data available. Select a language and click Scout Trends.
          </div>
        )}
      </div>
    </div>
  );
}
