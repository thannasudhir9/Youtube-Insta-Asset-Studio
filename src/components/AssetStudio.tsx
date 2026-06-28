import React, { useState, useEffect } from "react";
import { 
  Tv, 
  Sparkles, 
  RefreshCw, 
  FileText, 
  Video, 
  ChevronRight, 
  Copy, 
  Check, 
  Calendar, 
  Terminal, 
  Image as ImageIcon,
  Play,
  RotateCw,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Cloud,
  Database
} from "lucide-react";
import { TrendItem, QueueItem } from "../types";

interface AssetStudioProps {
  selectedSong: TrendItem | null;
  selectedLanguage: string;
  onAddToQueue: (item: Omit<QueueItem, "id">) => void;
  storageType: "local" | "drive";
  setStorageType: (type: "local" | "drive") => void;
}

export default function AssetStudio({ 
  selectedSong, 
  selectedLanguage, 
  onAddToQueue,
  storageType,
  setStorageType
}: AssetStudioProps) {
  const [songTitle, setSongTitle] = useState("");
  const [movieName, setMovieName] = useState("");
  const [singers, setSingers] = useState("");
  const [language, setLanguage] = useState("telugu");

  // Aesthetic Video Backdrops
  const backgroundPresets = [
    { name: "Mist & Rain Cafe", url: "https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?q=80&w=1080&auto=format&fit=crop" },
    { name: "Analog Cassette Spinner", url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1080&auto=format&fit=crop" },
    { name: "Late Night Slow Drive", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1080&auto=format&fit=crop" },
    { name: "Moody Sunset Horizon", url: "https://images.unsplash.com/photo-1501436513145-30f24e19fcc8?q=80&w=1080&auto=format&fit=crop" },
    { name: "Retro VHS TV Glow", url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1080&auto=format&fit=crop" }
  ];

  const [selectedBg, setSelectedBg] = useState(backgroundPresets[2].url);
  const [bgType, setBgType] = useState<"preset" | "ai">("preset");
  const [aiPrompt, setAiPrompt] = useState("90s vintage audio cassette player rotating, glowing yellow lofi ambient bedroom, neon cozy morning");
  const [aiGenerating, setAiGenerating] = useState(false);

  // Lyrics and Caption State
  const [lyricsSnippet, setLyricsSnippet] = useState("");
  const [translatedLyrics, setTranslatedLyrics] = useState("");
  const [instagramCaption, setInstagramCaption] = useState("");
  const [fetchingAiContent, setFetchingAiContent] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

  // Compilation Simulator
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileLogs, setCompileLogs] = useState<string[]>([]);
  const [videoCompiled, setVideoCompiled] = useState(false);

  // Initialize values when selectedSong changes
  useEffect(() => {
    if (selectedSong) {
      setSongTitle(selectedSong.title);
      setMovieName(selectedSong.movie);
      setSingers(selectedSong.singers);
      setLanguage(selectedLanguage || "telugu");
      // Pick background preset based on recommendations
      const rec = selectedSong.vibes.toLowerCase();
      if (rec.includes("rain") || rec.includes("window")) {
        setSelectedBg(backgroundPresets[0].url);
      } else if (rec.includes("cassette") || rec.includes("tape")) {
        setSelectedBg(backgroundPresets[1].url);
      } else if (rec.includes("sunset") || rec.includes("horizon")) {
        setSelectedBg(backgroundPresets[3].url);
      } else if (rec.includes("vhs") || rec.includes("tv")) {
        setSelectedBg(backgroundPresets[4].url);
      } else {
        setSelectedBg(backgroundPresets[2].url);
      }
      setLyricsSnippet("");
      setTranslatedLyrics("");
      setInstagramCaption("");
      setVideoCompiled(false);
    }
  }, [selectedSong, selectedLanguage]);

  // Call Gemini for lyrics sync, translation, and captions
  const fetchLyricsAndCaption = async () => {
    if (!songTitle) return;
    setFetchingAiContent(true);
    try {
      const res = await fetch("/api/gemini/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          song: songTitle,
          movie: movieName,
          language: language,
          tone: "emotional"
        })
      });
      const data = await res.json();
      setInstagramCaption(data.caption || "");
      setLyricsSnippet(data.lyricsSnippet || "");
      setTranslatedLyrics(data.translatedLyrics || "");
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingAiContent(false);
    }
  };

  // Generate Image via Gemini Image Gen
  const generateAIVisual = async () => {
    if (!aiPrompt) return;
    setAiGenerating(true);
    setBgType("ai");
    try {
      const res = await fetch("/api/gemini/generate-bg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await res.json();
      if (data.imageUrl) {
        setSelectedBg(data.imageUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiGenerating(false);
    }
  };

  // Copy to clipboard helper
  const copyCaption = () => {
    navigator.clipboard.writeText(instagramCaption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  // Simulate programmatic compilation steps
  const simulateFFmpegCompilation = () => {
    setIsCompiling(true);
    setCompileLogs([]);
    setVideoCompiled(false);

    const logs = [
      "[*] Initiating FFmpeg media compilation process...",
      "[*] Validating vertical resolution boundary: 1080 x 1920 (9:16 portrait)",
      "[*] Searching and validating local cache of the backdrop texture...",
      `[*] Loaded backdrop asset successfully (${bgType === "ai" ? "Gemini Custom AI Visual" : "Theme Preset"})`,
      "[*] Initializing network download protocol for music track hook clip...",
      `[*] Executing command: yt-dlp -x --audio-format mp3 --audio-quality 0 --external-downloader ffmpeg -o temp_audio "https://youtube.com/search?q=${encodeURIComponent(songTitle + ' ' + movieName + ' audio')}"`,
      "[+] Stream connection established. Parsing metadata tags...",
      "[+] Audio hook crop downloaded successfully (Length: 30.00s, Rate: 44100Hz)",
      "[*] Preparing drawtext overlay parameters. Font: Inter Bold, Size: 48px, Shadow: 4px offset",
      "[*] Synthesizing video frames with scrolling subtitles and brand logo watermark...",
      "[*] Processing filter graph: [0:v]scale=1080:1920,colorlevels,drawtext=lyrics,drawtext=watermark[out_v]",
      "[*] Encoding video streams: libx264 high-profile, level 4.0, pixel_format: yuv420p",
      "[*] Multiplexing audio and video channels into target media container...",
      "[+++] REEL COMPILATION COMPLETED SUCCESSFULLY!",
      "[+] Output file written to disk: /workspace/output/the90sbreeze_reel.mp4"
    ];

    logs.forEach((log, idx) => {
      setTimeout(() => {
        setCompileLogs(prev => [...prev, log]);
        if (idx === logs.length - 1) {
          setIsCompiling(false);
          setVideoCompiled(true);
        }
      }, (idx + 1) * 350);
    });
  };

  // Queue Item Handler
  const handleQueuePost = () => {
    onAddToQueue({
      song: songTitle || "Untitled Classic",
      movie: movieName || "90s Hit",
      language: language,
      caption: instagramCaption || `The nostalgic 90s breeze... 🥺❤️\n\n#90sbreeze #${language}songs`,
      lyricsSnippet: lyricsSnippet,
      translatedLyrics: translatedLyrics,
      bgUrl: selectedBg,
      publishDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Tomorrow
      status: "scheduled",
      platforms: ["instagram", "youtube"]
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="asset-studio">
      
      {/* LEFT COLUMN: Visual Media Generator & Real-time Live Simulator (Grid Span 5) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Video className="w-4 h-4 text-indigo-600" />
            9:16 Video Player Mockup
          </h3>
          
          {/* Vertical Video Frame */}
          <div className="relative aspect-[9/16] w-full max-w-[280px] mx-auto bg-slate-900 border-4 border-slate-950 rounded-[32px] overflow-hidden shadow-2xl shadow-slate-950/30">
            {/* Reel Backdrop */}
            <img 
              src={selectedBg} 
              alt="Reel Background" 
              className="w-full h-full object-cover brightness-[0.55] transition-all duration-300"
              referrerPolicy="no-referrer"
            />

            {/* Simulated VHS grain scanner overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-40" />

            {/* Reel Header / Audio info overlays */}
            <div className="absolute top-5 left-4 right-4 flex items-center justify-between text-white text-[10px] font-mono bg-black/30 backdrop-blur-sm px-2.5 py-1.5 rounded-full border border-white/10">
              <span className="truncate">🎵 {songTitle || "Select a Song"}</span>
              <span className="text-indigo-300">0:15 / 0:30</span>
            </div>

            {/* CENTER: Lyrics burn-in subtitle display */}
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 text-center space-y-2">
              {lyricsSnippet ? (
                <div className="p-3 bg-black/40 backdrop-blur-sm border border-white/5 rounded-xl">
                  <p className="text-sm font-semibold text-white tracking-wide leading-relaxed animate-fade-in font-sans">
                    {lyricsSnippet.replace(/\[\d+:\d+\]/g, "").split("\n")[0]}
                  </p>
                  <p className="text-xs font-medium text-indigo-300/90 italic mt-1 font-sans">
                    {translatedLyrics ? translatedLyrics.split("\n")[0] : "90s Nostalgia hits..."}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-black/40 backdrop-blur-sm border border-dashed border-white/10 rounded-xl">
                  <p className="text-xs text-slate-300 font-mono">
                    Subtitles burn-in simulation
                  </p>
                </div>
              )}
            </div>

            {/* Bottom watermark / profile info */}
            <div className="absolute bottom-6 left-4 right-4 flex items-end justify-between">
              <div className="text-left text-white space-y-1">
                <p className="text-xs font-bold font-sans">@the90s_breeze</p>
                <p className="text-[9px] text-slate-300 leading-snug font-sans">
                  Nostalgic 90s {language.toUpperCase()} hits. Turn up the volume! 🎧✨
                </p>
              </div>
              
              {/* Instagram vertical sidebar actions */}
              <div className="flex flex-col gap-3 text-white text-center">
                <div className="flex flex-col items-center">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  <span className="text-[8px] font-mono mt-0.5">14.2K</span>
                </div>
                <div className="flex flex-col items-center">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-[8px] font-mono mt-0.5">384</span>
                </div>
                <div className="flex flex-col items-center">
                  <Bookmark className="w-5 h-5" />
                  <span className="text-[8px] font-mono mt-0.5">852</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Backdrop Visual Assets Configurator */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <ImageIcon className="w-4 h-4 text-indigo-600" />
            Reel Background Canvas
          </h4>

          {/* Preset Grid */}
          <div className="space-y-3">
            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Select Backdrop Preset</label>
            <div className="grid grid-cols-5 gap-1.5">
              {backgroundPresets.map((bg, idx) => (
                <button
                  key={idx}
                  onClick={() => { setSelectedBg(bg.url); setBgType("preset"); }}
                  className={`relative aspect-square rounded-lg overflow-hidden border ${
                    selectedBg === bg.url && bgType === "preset"
                      ? "border-indigo-600 scale-95 ring-2 ring-indigo-600/20" 
                      : "border-slate-200 hover:border-slate-300"
                  } cursor-pointer`}
                  title={bg.name}
                >
                  <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* AI Generator prompt container */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">AI Custom Image Gen</label>
              <span className="px-1.5 py-0.5 text-[8px] font-mono text-indigo-700 bg-indigo-50 rounded border border-indigo-100 font-semibold">
                Gemini 2.5 Image
              </span>
            </div>
            
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Enter visual details..."
              className="w-full h-16 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500/80 focus:bg-white resize-none transition"
            />

            <button
              onClick={generateAIVisual}
              disabled={aiGenerating || !aiPrompt}
              className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 disabled:bg-slate-50 disabled:text-slate-400 text-xs text-indigo-950 font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {aiGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  Generating Custom Backdrop...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Generate Custom Backdrop
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Studio Editors, Lyrics Fetch, FFMpeg Compiler Simulation (Grid Span 7) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Storage Provider Global Toggle */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3" id="storage-provider-settings-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Global Content Storage Provider
                </h4>
                <p className="text-[10px] text-slate-400">Select where YouTube hook assets are saved and indexed</p>
              </div>
            </div>
            
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setStorageType("local")}
                className={`px-3 py-1 text-[9px] font-black uppercase rounded-md transition cursor-pointer tracking-wider flex items-center gap-1 ${
                  storageType === "local"
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Database className="w-3 h-3 text-indigo-500" />
                Local
              </button>
              <button
                type="button"
                onClick={() => setStorageType("drive")}
                className={`px-3 py-1 text-[9px] font-black uppercase rounded-md transition cursor-pointer tracking-wider flex items-center gap-1 ${
                  storageType === "drive"
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Cloud className="w-3 h-3 text-indigo-500" />
                Drive
              </button>
            </div>
          </div>
        </div>

        {/* Step 1: Track Details Confirmation */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2 py-1 text-[10px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-100 rounded uppercase font-bold">
              STUDIO SOURCE ASSETS
            </span>
            <span className="text-[10px] font-mono text-slate-400">Region: India-90s</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Song Title</label>
              <input
                type="text"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                placeholder="E.g., Priya Priyathama"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500/80 focus:bg-white mt-1 transition"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Movie / Film</label>
              <input
                type="text"
                value={movieName}
                onChange={(e) => setMovieName(e.target.value)}
                placeholder="E.g., Killer"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500/80 focus:bg-white mt-1 transition"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Singers / Musicians</label>
              <input
                type="text"
                value={singers}
                onChange={(e) => setSingers(e.target.value)}
                placeholder="E.g., S. P. B, Chithra"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500/80 focus:bg-white mt-1 transition"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Primary Language Group</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500/80 focus:bg-white mt-1 transition cursor-pointer"
              >
                <option value="telugu">Telugu (Melodies)</option>
                <option value="tamil">Tamil (SPB Classics)</option>
                <option value="hindi">Hindi (90s Romance)</option>
                <option value="malayalam">Malayalam (Evergreen)</option>
              </select>
            </div>
          </div>

          <button
            onClick={fetchLyricsAndCaption}
            disabled={fetchingAiContent || !songTitle}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400/40 disabled:text-slate-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
          >
            {fetchingAiContent ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Interrogating Music Databases via Gemini...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Autofill Synced Lyrics & Instagram Captions with Gemini AI
              </>
            )}
          </button>
        </div>

        {/* Step 2: Lyrics & Translation Display */}
        {lyricsSnippet && (
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              Synced Lyrics & Nostalgia Translation
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Original Lyrics Snippet</label>
                <textarea
                  value={lyricsSnippet}
                  onChange={(e) => setLyricsSnippet(e.target.value)}
                  className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500/80 focus:bg-white resize-none transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Aesthetic English Translation</label>
                <textarea
                  value={translatedLyrics}
                  onChange={(e) => setTranslatedLyrics(e.target.value)}
                  className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:outline-none focus:border-indigo-500/80 focus:bg-white resize-none transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Video Reel Compile Engine */}
        {lyricsSnippet && (
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-slate-400" />
                Programmatic Video Synthesis Terminal (FFmpeg Simulator)
              </h4>
              <span className="px-2 py-0.5 text-[8px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 rounded uppercase font-bold">
                FFmpeg Engine
              </span>
            </div>

            {/* Run Compilation Button */}
            <button
              onClick={simulateFFmpegCompilation}
              disabled={isCompiling}
              className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-800 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Video className="w-4 h-4 text-indigo-600" />
              Compile Vertical Video (FFMpeg Synthesis)
            </button>

            {/* Logs console */}
            {(isCompiling || compileLogs.length > 0) && (
              <div className="p-4 bg-slate-900 border border-slate-950 rounded-xl font-mono text-[10px] text-emerald-400 space-y-1.5 h-48 overflow-y-auto custom-scrollbar shadow-inner">
                {compileLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span>{log}</span>
                  </div>
                ))}
                {isCompiling && (
                  <div className="flex items-center gap-2 text-amber-400 font-semibold animate-pulse mt-2">
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    Compiling media streams... Please hold
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4: AI Optimized Caption & Scheduler Queue */}
        {instagramCaption && (
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                Optimized Social Caption (Instagram / YouTube)
              </h4>
              <button
                onClick={copyCaption}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition cursor-pointer"
                title="Copy Caption"
              >
                {copiedCaption ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <textarea
              value={instagramCaption}
              onChange={(e) => setInstagramCaption(e.target.value)}
              className="w-full h-44 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500/80 focus:bg-white transition"
            />

            {/* Queue Trigger button */}
            <button
              onClick={handleQueuePost}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              Lock & Queue Video to Content Calendar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
