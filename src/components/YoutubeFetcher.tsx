import React, { useState, useEffect, useRef } from "react";
import { 
  Tv, 
  Download, 
  Sparkles, 
  Music, 
  Video, 
  Folder, 
  Save, 
  Check, 
  Copy, 
  Volume2, 
  AlertCircle, 
  Cloud, 
  Database, 
  Play, 
  Pause, 
  Loader2, 
  Trash2, 
  RefreshCw,
  Calendar
} from "lucide-react";
import { User } from "firebase/auth";
import { getAccessToken, signInWithGoogle } from "../lib/firebase";
import { QueueItem } from "../types";

interface YoutubeFetcherProps {
  user: User | null;
  onAddToQueue: (item: Omit<QueueItem, "id">) => void;
  onGoogleSignIn: () => Promise<void>;
  storageType: "local" | "drive";
  setStorageType: (type: "local" | "drive") => void;
}

interface AnalyzedAsset {
  videoId: string;
  title: string;
  movie: string;
  year: number;
  singers: string;
  hookStart: number; // in seconds
  hookEnd: number; // in seconds
  mood: string;
  vibes: string;
  lyricsSnippet: string;
  translatedLyrics: string;
  caption: string;
}

interface StoredAsset {
  id: string;
  name: string;
  source: "local" | "drive";
  driveFileId?: string;
  title: string;
  movie: string;
  year: number;
  hookStart: number;
  hookEnd: number;
  savedAt: string;
  data: AnalyzedAsset;
}

export default function YoutubeFetcher({ user, onAddToQueue, onGoogleSignIn, storageType, setStorageType }: YoutubeFetcherProps) {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [fetchStep, setFetchStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [analyzedData, setAnalyzedData] = useState<AnalyzedAsset | null>(null);

  // YouTube Search States
  const [activeInputTab, setActiveInputTab] = useState<"search" | "url">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ videoId: string; title: string; snippet: string; channelTitle: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  
  // Storage Options
  const [driveFolderId, setDriveFolderId] = useState<string | null>(null);
  const [driveFiles, setDriveFiles] = useState<{ id: string; name: string; createdTime: string }[]>([]);
  const [localAssets, setLocalAssets] = useState<StoredAsset[]>([]);
  const [loadingDriveFiles, setLoadingDriveFiles] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Video loop states
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [loopEnabled, setLoopEnabled] = useState(true);

  // Loop parameters (proposals from Gemini, adjustable by user)
  const [loopStart, setLoopStart] = useState<number>(0);
  const [loopEnd, setLoopEnd] = useState<number>(0);

  const loopStartRef = useRef<number>(0);
  const loopEndRef = useRef<number>(0);

  useEffect(() => {
    loopStartRef.current = loopStart;
    loopEndRef.current = loopEnd;
  }, [loopStart, loopEnd]);

  useEffect(() => {
    if (analyzedData) {
      setLoopStart(analyzedData.hookStart);
      setLoopEnd(analyzedData.hookEnd);
    }
  }, [analyzedData]);

  // Copied states
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedLyrics, setCopiedLyrics] = useState(false);

  const playerRef = useRef<any>(null);
  const loopIntervalRef = useRef<any>(null);

  // Steps during stream fetch and analysis simulation
  const fetchSteps = [
    "Establishing pipeline handshake with YouTube server...",
    "Querying stream codecs and checking audio extraction rates...",
    "Downloading high-quality video and audio feeds...",
    "Sending video context to Gemini AI with search grounding...",
    "Analyzing melody curves and identifying maximum emotion peak...",
    "Formatting nostalgic lyrics transliterations and caption cards..."
  ];

  // Load local saved files on mount
  useEffect(() => {
    loadLocalAssets();
  }, []);

  // Sync Google Drive files list when user changes or storage type becomes drive
  useEffect(() => {
    if (storageType === "drive" && user) {
      syncGoogleDrive();
    }
  }, [storageType, user]);

  // Clean up looping intervals on unmount
  useEffect(() => {
    return () => {
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current);
      }
    };
  }, []);

  // Setup Youtube IFrame API Looper when analyzedData is loaded or changed
  useEffect(() => {
    if (!analyzedData) return;

    // Load YT SDK if not present
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      // If player already exists, destroy it first
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.warn(e);
        }
        playerRef.current = null;
      }

      setIsPlayerReady(false);
      setIsPlaying(false);

      playerRef.current = new (window as any).YT.Player("youtube-looper-iframe", {
        videoId: analyzedData.videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          start: loopStartRef.current,
          end: loopEndRef.current
        },
        events: {
          onReady: (event: any) => {
            setIsPlayerReady(true);
            setIsPlaying(true);
            event.target.playVideo();
            event.target.seekTo(loopStartRef.current);
            startLoopTracker();
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.PLAYING is 1
            if (event.data === 1) {
              setIsPlaying(true);
            } else {
              setIsPlaying(false);
            }
          }
        }
      });
    };

    // Wait until YT global is ready
    const checkYTReady = setInterval(() => {
      if ((window as any).YT && (window as any).YT.Player) {
        clearInterval(checkYTReady);
        initPlayer();
      }
    }, 100);

    return () => {
      clearInterval(checkYTReady);
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current);
      }
    };
  }, [analyzedData]);

  const startLoopTracker = () => {
    if (loopIntervalRef.current) clearInterval(loopIntervalRef.current);

    loopIntervalRef.current = setInterval(() => {
      if (!playerRef.current || !analyzedData) return;
      try {
        const curr = playerRef.current.getCurrentTime();
        setCurrentTime(curr);

        if (loopEnabled) {
          // If the player goes past the end of the viral hook, jump back to the start!
          if (curr >= loopEndRef.current || curr < loopStartRef.current - 1) {
            playerRef.current.seekTo(loopStartRef.current);
            playerRef.current.playVideo();
          }
        }
      } catch (err) {
        // Suppress player errors during load transitions
      }
    }, 500);
  };

  const adjustLoopStart = (amount: number) => {
    setLoopStart(prev => {
      const next = Math.max(0, prev + amount);
      if (next >= loopEnd - 1) return prev; // Keep at least 1s gap
      return next;
    });
  };

  const adjustLoopEnd = (amount: number) => {
    setLoopEnd(prev => {
      const next = prev + amount;
      if (next <= loopStart + 1) return prev; // Keep at least 1s gap
      return next;
    });
  };

  const triggerSeekToLoopStart = () => {
    if (playerRef.current) {
      try {
        playerRef.current.seekTo(loopStart);
        playerRef.current.playVideo();
      } catch (e) {}
    }
  };

  const loadLocalAssets = () => {
    try {
      const data = localStorage.getItem("the90s_Breeze_local_assets");
      if (data) {
        setLocalAssets(JSON.parse(data));
      }
    } catch (e) {
      console.error("Error loading local assets: ", e);
    }
  };

  const triggerDirectAnalysis = async (urlToAnalyze: string) => {
    if (!urlToAnalyze.trim()) return;

    setIsFetching(true);
    setFetchStep(0);
    setErrorMsg("");
    setAnalyzedData(null);

    // Dynamic, engaging loading stage updates
    const interval = setInterval(() => {
      setFetchStep(prev => {
        if (prev < fetchSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 2200);

    try {
      const response = await fetch("/api/youtube/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToAnalyze })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to analyze YouTube link.");
      }

      const result: AnalyzedAsset = await response.json();
      clearInterval(interval);
      setAnalyzedData(result);
    } catch (err: any) {
      clearInterval(interval);
      setErrorMsg(err.message || "An unexpected error occurred during pipeline analysis.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleFetchAndAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    await triggerDirectAnalysis(youtubeUrl);
  };

  const handleYoutubeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError("");
    setSearchResults([]);

    try {
      const response = await fetch("/api/youtube/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery })
      });

      if (!response.ok) {
        throw new Error("Failed to search YouTube videos.");
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (err: any) {
      setSearchError(err.message || "An error occurred during YouTube search.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (videoId: string) => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    setYoutubeUrl(url);
    setActiveInputTab("url");
    triggerDirectAnalysis(url);
  };

  // Google Drive Handlers
  const syncGoogleDrive = async () => {
    const token = await getAccessToken();
    if (!token) {
      console.warn("No Google OAuth access token found. Prompt user to authorize.");
      return;
    }

    setLoadingDriveFiles(true);
    try {
      // 1. Find or create the "the90s_Breeze" folder
      let folderId = "";
      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='the90s_Breeze' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id, name)`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const searchData = await searchRes.json();

      if (searchData.files && searchData.files.length > 0) {
        folderId = searchData.files[0].id;
      } else {
        // Create the folder
        const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: "the90s_Breeze",
            mimeType: "application/vnd.google-apps.folder"
          })
        });
        const createData = await createRes.json();
        folderId = createData.id;
      }

      setDriveFolderId(folderId);

      // 2. Fetch files inside this folder
      const filesRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false&fields=files(id, name, createdTime)&orderBy=createdTime desc`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const filesData = await filesRes.json();
      setDriveFiles(filesData.files || []);
    } catch (err) {
      console.error("Failed to sync with Google Drive: ", err);
    } finally {
      setLoadingDriveFiles(false);
    }
  };

  const handleSaveAsset = async () => {
    if (!analyzedData) return;
    setSaveSuccess(false);

    const assetId = Math.random().toString(36).substring(2, 9);
    const assetName = `yt_${analyzedData.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;

    // Merge custom adjusted loop parameters back into the saved state
    const adjustedData = {
      ...analyzedData,
      hookStart: loopStart,
      hookEnd: loopEnd
    };

    if (storageType === "local") {
      // Save locally
      const newLocalAsset: StoredAsset = {
        id: assetId,
        name: `${analyzedData.title} (Local)`,
        source: "local",
        title: analyzedData.title,
        movie: analyzedData.movie,
        year: analyzedData.year,
        hookStart: loopStart,
        hookEnd: loopEnd,
        savedAt: new Date().toLocaleDateString(),
        data: adjustedData
      };

      const updated = [newLocalAsset, ...localAssets];
      setLocalAssets(updated);
      localStorage.setItem("the90s_Breeze_local_assets", JSON.stringify(updated));

      // Trigger high-quality interactive offline bundle download for their laptop
      const cleanTitle = analyzedData.title.replace(/[^a-zA-Z0-9]/g, "_");
      
      const shContent = `#!/bin/bash
# 90s Breeze - Auto-Trim YouTube Video Downloader
echo "=================================================="
echo "    90s Breeze - Downloader Script for Hook       "
echo "=================================================="
echo "Song: ${analyzedData.title}"
echo "Movie: ${analyzedData.movie} (${analyzedData.year})"
echo "Trim Segment: ${loopStart}s to ${loopEnd}s"
echo "=================================================="

if ! command -v yt-dlp &> /dev/null; then
    echo "ERROR: 'yt-dlp' is not installed."
    echo "Please install it using your package manager."
    echo "Mac (Homebrew): brew install yt-dlp ffmpeg"
    exit 1
fi

echo "Downloading and trimming video... Please wait."
yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]" \\
  --external-downloader ffmpeg \\
  --external-downloader-args "ffmpeg_i:-ss ${loopStart} -to ${loopEnd}" \\
  "https://www.youtube.com/watch?v=${analyzedData.videoId}" \\
  -o "${cleanTitle}_viral_hook.mp4"

echo "=================================================="
echo "Success! Hook downloaded as: ${cleanTitle}_viral_hook.mp4"
echo "=================================================="
`;

      const batContent = `@echo off
title 90s Breeze - Downloader Script
echo ==================================================
echo     90s Breeze - Downloader Script for Hook       
echo ==================================================
echo Song: ${analyzedData.title}
echo Movie: ${analyzedData.movie} (${analyzedData.year})
echo Trim Segment: ${loopStart}s to ${loopEnd}s
echo ==================================================

where yt-dlp >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: 'yt-dlp' is not installed or not in PATH.
    echo Please install it and ensure ffmpeg is also available.
    pause
    exit /b
)

echo Downloading and trimming video... Please wait.
yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]" --external-downloader ffmpeg --external-downloader-args "ffmpeg_i:-ss ${loopStart} -to ${loopEnd}" "https://www.youtube.com/watch?v=${analyzedData.videoId}" -o "${cleanTitle}_viral_hook.mp4"

echo ==================================================
echo Success! Hook downloaded as: ${cleanTitle}_viral_hook.mp4
echo ==================================================
pause
`;

      const escapedShContent = shContent.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
      const escapedBatContent = batContent.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");

      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>90s Breeze - ${analyzedData.title} (Offline Loop Player)</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
        body {
            font-family: 'Inter', sans-serif;
            background: radial-gradient(circle at center, #0f172a 0%, #020617 100%);
        }
        .retro-card {
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(12px);
        }
    </style>
</head>
<body class="text-slate-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
    <div class="max-w-4xl mx-auto w-full space-y-8">
        <!-- Header -->
        <header class="flex items-center justify-between border-b border-slate-800 pb-4">
            <div class="flex items-center gap-3">
                <span class="text-2xl">🍃</span>
                <div>
                    <h1 class="text-xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
                        90s Breeze Offline Portal
                    </h1>
                    <p class="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">Viral Hook Interactive Studio</p>
                </div>
            </div>
            <span class="text-xs bg-slate-800 text-indigo-400 font-mono px-2.5 py-1 rounded-full border border-slate-700 font-bold shadow-inner">
                OFFLINE SYNC ACTIVE
            </span>
        </header>

        <!-- Main Workspace -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- Left Side: Interactive Video Player (Span 7) -->
            <div class="lg:col-span-7 space-y-6">
                <!-- Video Container -->
                <div class="retro-card rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                    <div class="aspect-video w-full bg-slate-950 relative">
                        <div id="player" class="w-full h-full"></div>
                    </div>
                    <div class="p-4 bg-slate-900/60 border-t border-slate-800/80 space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-slate-400">Perfect Loop Control</span>
                            <span class="text-[10px] font-mono text-indigo-400 bg-indigo-950/50 px-2 py-0.5 border border-indigo-900/40 rounded-full">
                                Interval: ${loopStart}s - ${loopEnd}s
                            </span>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="togglePlay()" id="playBtn" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow">
                                Play / Pause Video
                            </button>
                            <button onclick="seekToStart()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 border border-slate-700">
                                Restart Hook
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Lyrics section -->
                <div class="retro-card rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
                    <h3 class="text-sm font-extrabold text-white border-b border-slate-800 pb-2">Regional Lyrics & Hook Translation</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-1.5">
                            <span class="text-[10px] font-mono text-orange-400 uppercase tracking-widest">Native Lyrics</span>
                            <div class="bg-slate-950/40 p-3 rounded-xl border border-slate-900 text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
${analyzedData.lyricsSnippet}
                            </div>
                        </div>
                        <div class="space-y-1.5">
                            <span class="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">English Translation</span>
                            <div class="bg-slate-950/40 p-3 rounded-xl border border-slate-900 text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
${analyzedData.translatedLyrics}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Side: Downloader & Details (Span 5) -->
            <div class="lg:col-span-5 space-y-6">
                <!-- Track Meta Details -->
                <div class="retro-card rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
                    <span class="text-[10px] bg-pink-950/40 text-pink-400 border border-pink-900/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest font-mono">
                        Track Profile
                    </span>
                    <div>
                        <h2 class="text-lg font-extrabold text-white leading-tight">${analyzedData.title}</h2>
                        <p class="text-xs text-slate-400 mt-1">
                            🎬 Movie: <strong class="text-slate-200">${analyzedData.movie}</strong> (${analyzedData.year})
                        </p>
                        <p class="text-xs text-slate-400 mt-0.5">
                            🎤 Singers: <strong class="text-slate-200">${analyzedData.singers}</strong>
                        </p>
                    </div>
                    <div class="border-t border-slate-800/80 pt-3 space-y-2 text-xs">
                        <div>
                            <span class="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Aesthetic Mood</span>
                            <span class="text-slate-300 font-semibold">${analyzedData.mood}</span>
                        </div>
                        <div>
                            <span class="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Vintage Vibes</span>
                            <span class="text-slate-300">${analyzedData.vibes}</span>
                        </div>
                    </div>
                </div>

                <!-- Downloader Panel -->
                <div class="retro-card rounded-2xl p-6 border border-slate-800 bg-gradient-to-b from-indigo-950/20 to-slate-950/40 shadow-xl space-y-4">
                    <div class="flex items-center gap-2">
                        <span class="text-lg">💾</span>
                        <div>
                            <h3 class="text-sm font-extrabold text-white">Local Laptop Video Downloader</h3>
                            <p class="text-[10px] text-slate-400 mt-0.5">Save the actual high-quality looped MP4 clip offline</p>
                        </div>
                    </div>

                    <!-- Direct Script Download Buttons -->
                    <div class="grid grid-cols-2 gap-2">
                        <button onclick="downloadScript('sh')" class="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-[10px] font-extrabold uppercase tracking-widest flex flex-col items-center gap-1 cursor-pointer transition">
                            <span class="text-lg">🍎 Linux / Mac</span>
                            <span>Get shell (.sh)</span>
                        </button>
                        <button onclick="downloadScript('bat')" class="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-[10px] font-extrabold uppercase tracking-widest flex flex-col items-center gap-1 cursor-pointer transition">
                            <span class="text-lg">💻 Windows</span>
                            <span>Get batch (.bat)</span>
                        </button>
                    </div>

                    <!-- Copy Command Card -->
                    <div class="space-y-1.5">
                        <div class="flex items-center justify-between text-[10px] font-mono text-slate-500">
                            <span>DIRECT TERMINAL COMMAND (yt-dlp)</span>
                            <button onclick="copyCommand()" class="text-indigo-400 hover:text-indigo-300 cursor-pointer font-bold uppercase">Copy</button>
                        </div>
                        <div class="bg-slate-950 p-3 rounded-xl border border-slate-900 overflow-x-auto">
                            <code id="cmdText" class="text-[10px] font-mono text-orange-300 whitespace-nowrap block">yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]" --external-downloader ffmpeg --external-downloader-args "ffmpeg_i:-ss ${loopStart} -to ${loopEnd}" "https://www.youtube.com/watch?v=${analyzedData.videoId}" -o "${cleanTitle}_viral_hook.mp4"</code>
                        </div>
                    </div>

                    <!-- User Guide -->
                    <div class="bg-slate-950/50 p-4 rounded-xl border border-slate-900 space-y-2">
                        <span class="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Quick Local Installation Guide</span>
                        <ol class="text-[10px] text-slate-400 space-y-1 list-decimal pl-3 font-medium">
                            <li>Ensure <strong class="text-slate-300">yt-dlp</strong> and <strong class="text-slate-300">ffmpeg</strong> are installed on your laptop.</li>
                            <li>Download the helper script above for your system, move it to your preferred folder, and run it!</li>
                            <li>The script will download the YouTube stream, isolate the hook, and output a perfectly trimmed MP4.</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <span>Built by <strong>90s Breeze</strong> • Your retro music compiler</span>
            <div class="flex gap-4">
                <a href="https://github.com/yt-dlp/yt-dlp" target="_blank" class="hover:text-slate-300 transition">Get yt-dlp</a>
                <a href="https://ffmpeg.org" target="_blank" class="hover:text-slate-300 transition">Get ffmpeg</a>
            </div>
        </footer>
    </div>

    <!-- YouTube API Loop Player Implementation -->
    <script>
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        var player;
        var loopStart = ${loopStart};
        var loopEnd = ${loopEnd};
        var checkInterval;

        function onYouTubeIframeAPIReady() {
            player = new YT.Player('player', {
                height: '100%',
                width: '100%',
                videoId: '${analyzedData.videoId}',
                playerVars: {
                    'playsinline': 1,
                    'controls': 1,
                    'autoplay': 1,
                    'start': loopStart,
                    'end': loopEnd,
                    'modestbranding': 1,
                    'rel': 0
                },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        }

        function onPlayerReady(event) {
            player.seekTo(loopStart);
            player.playVideo();
            startLoopTracker();
        }

        function onPlayerStateChange(event) {
            if (event.data === YT.PlayerState.ENDED) {
                player.seekTo(loopStart);
                player.playVideo();
            }
        }

        function startLoopTracker() {
            if (checkInterval) clearInterval(checkInterval);
            checkInterval = setInterval(function() {
                if (player && typeof player.getCurrentTime === 'function') {
                    var curr = player.getCurrentTime();
                    if (curr >= loopEnd || curr < loopStart - 1) {
                        player.seekTo(loopStart);
                        player.playVideo();
                    }
                }
            }, 500);
        }

        function togglePlay() {
            if (!player) return;
            var state = player.getPlayerState();
            var btn = document.getElementById('playBtn');
            if (state === YT.PlayerState.PLAYING) {
                player.pauseVideo();
                btn.innerHTML = 'Play Video';
            } else {
                player.playVideo();
                btn.innerHTML = 'Pause Video';
            }
        }

        function seekToStart() {
            if (player) {
                player.seekTo(loopStart);
                player.playVideo();
            }
        }

        function copyCommand() {
            var cmd = document.getElementById('cmdText').innerText;
            navigator.clipboard.writeText(cmd).then(function() {
                alert('Terminal command copied!');
            });
        }

        function downloadScript(type) {
            var filename = "${cleanTitle}_download_hook." + type;
            var content = "";
            
            if (type === 'sh') {
                content = \`${escapedShContent}\`;
            } else if (type === 'bat') {
                content = \`${escapedBatContent}\`;
            }
            
            var blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }
    </script>
</body>
</html>`;

      const htmlBlob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const htmlUrl = URL.createObjectURL(htmlBlob);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.href = htmlUrl;
      downloadAnchor.download = `${cleanTitle}_offline_loop_player.html`;
      downloadAnchor.click();
      URL.revokeObjectURL(htmlUrl);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      // Save to Google Drive
      const token = await getAccessToken();
      if (!token) {
        alert("You must be logged in with Google to save to Drive!");
        return;
      }

      try {
        let folderId = driveFolderId;
        if (!folderId) {
          await syncGoogleDrive();
          folderId = driveFolderId;
        }

        if (!folderId) {
          throw new Error("Could not find or create Google Drive folder.");
        }

        const metadata = {
          name: `${assetName}.json`,
          parents: [folderId],
          mimeType: "application/json"
        };

        const fileContent = JSON.stringify(adjustedData, null, 2);

        // Standard multipart upload format
        const boundary = "3d7a19dc_the90sbreeze";
        const delimiter = `\r\n--${boundary}\r\n`;
        const closeDelimiter = `\r\n--${boundary}--`;

        const body =
          delimiter +
          "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
          JSON.stringify(metadata) +
          delimiter +
          "Content-Type: application/json\r\n\r\n" +
          fileContent +
          closeDelimiter;

        const uploadRes = await fetch(
          "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": `multipart/related; boundary=${boundary}`
            },
            body: body
          }
        );

        if (!uploadRes.ok) {
          throw new Error("Failed to upload file to Google Drive");
        }

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        await syncGoogleDrive(); // refresh drive list
      } catch (err: any) {
        console.error("Error saving to Drive: ", err);
        alert(`Failed to save to Google Drive: ${err.message}`);
      }
    }
  };

  const handleDeleteLocalAsset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm("Are you sure you want to delete this locally saved asset?");
    if (!confirmed) return;

    const updated = localAssets.filter(item => item.id !== id);
    setLocalAssets(updated);
    localStorage.setItem("the90s_Breeze_local_assets", JSON.stringify(updated));
  };

  const handleDeleteDriveAsset = async (fileId: string, fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Are you sure you want to delete '${fileName}' from your Google Drive folder?`);
    if (!confirmed) return;

    const token = await getAccessToken();
    if (!token) return;

    try {
      const deleteRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!deleteRes.ok) {
        throw new Error("Failed to delete the file from Google Drive.");
      }

      await syncGoogleDrive();
    } catch (err: any) {
      alert(`Failed to delete asset: ${err.message}`);
    }
  };

  const handleLoadAsset = (asset: StoredAsset) => {
    setAnalyzedData(asset.data);
    setYoutubeUrl(`https://www.youtube.com/watch?v=${asset.data.videoId}`);
  };

  const handleLoadDriveAsset = async (fileId: string) => {
    const token = await getAccessToken();
    if (!token) return;

    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load file contents from Google Drive.");

      const data: AnalyzedAsset = await res.json();
      setAnalyzedData(data);
      setYoutubeUrl(`https://www.youtube.com/watch?v=${data.videoId}`);
    } catch (err: any) {
      alert(`Error loading file content: ${err.message}`);
    }
  };

  const handleAddToActiveQueue = () => {
    if (!analyzedData) return;

    onAddToQueue({
      song: analyzedData.title,
      movie: analyzedData.movie,
      language: "Original (90s)",
      caption: analyzedData.caption,
      lyricsSnippet: analyzedData.lyricsSnippet,
      translatedLyrics: analyzedData.translatedLyrics,
      bgUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1080&auto=format&fit=crop",
      publishDate: new Date().toISOString().split("T")[0],
      status: "scheduled",
      platforms: ["instagram", "youtube"]
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const copyToClipboard = (text: string, type: "caption" | "lyrics") => {
    navigator.clipboard.writeText(text);
    if (type === "caption") {
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    } else {
      setCopiedLyrics(true);
      setTimeout(() => setCopiedLyrics(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="youtube-fetcher-panel">
      
      {/* Left Input & Status Panel (Grid Span 5) */}
      <div className="xl:col-span-5 space-y-6">
        
        {/* Fetcher Form Card */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-950/40 border border-red-500/20 text-red-400 rounded-xl">
              <Tv className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">YouTube Hook Indexer</h3>
              <p className="text-[10px] text-slate-400 font-medium">Extract, Analyze, and Loop Viral Elements</p>
            </div>
          </div>

          {/* Dual Input Tabs */}
          <div className="flex bg-slate-950 p-0.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveInputTab("search")}
              className={`flex-1 py-1.5 text-[10px] font-black uppercase rounded-lg transition cursor-pointer tracking-wider flex items-center justify-center gap-1.5 ${
                activeInputTab === "search"
                  ? "bg-red-950/40 text-red-400 border border-red-900/40 font-bold"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span>🔍</span> Search YouTube
            </button>
            <button
              type="button"
              onClick={() => setActiveInputTab("url")}
              className={`flex-1 py-1.5 text-[10px] font-black uppercase rounded-lg transition cursor-pointer tracking-wider flex items-center justify-center gap-1.5 ${
                activeInputTab === "url"
                  ? "bg-red-950/40 text-red-400 border border-red-900/40 font-bold"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span>🔗</span> Direct URL
            </button>
          </div>

          {/* Tab 1: YouTube Search */}
          {activeInputTab === "search" && (
            <div className="space-y-4">
              <form onSubmit={handleYoutubeSearch} className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                  Search Song or Movie Title
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g., Priya Priyathama Killer"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none transition"
                  />
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-slate-800 text-white font-bold text-xs px-4 rounded-xl transition uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md"
                  >
                    {isSearching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Search</span>
                    )}
                  </button>
                </div>
              </form>

              {searchError && (
                <div className="p-2.5 bg-rose-950/20 rounded-xl border border-rose-500/20 text-rose-300 text-[10px] font-medium leading-relaxed">
                  {searchError}
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                    Select a video to load & auto-analyze:
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {searchResults.map((result) => (
                      <button
                        key={result.videoId}
                        type="button"
                        onClick={() => handleSelectSearchResult(result.videoId)}
                        className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800/80 hover:border-slate-700 rounded-xl transition flex flex-col gap-1 cursor-pointer group"
                      >
                        <div className="flex items-center gap-1.5 justify-between">
                          <span className="text-xs font-bold text-slate-100 group-hover:text-red-400 transition line-clamp-1">
                            {result.title}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-slate-500 shrink-0 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                            {result.videoId}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                          <span className="truncate max-w-[150px] text-slate-500 font-semibold">{result.channelTitle}</span>
                          <span className="text-[9px] text-red-500 font-extrabold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition">Import & Trim →</span>
                        </div>
                        {result.snippet && (
                          <p className="text-[9px] text-slate-500 line-clamp-1 italic mt-0.5">{result.snippet}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Direct URL */}
          {activeInputTab === "url" && (
            <form onSubmit={handleFetchAndAnalyze} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                  YouTube Video or Audio URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    disabled={isFetching}
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none transition"
                  />
                  <button
                    type="submit"
                    disabled={isFetching}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-slate-800 text-white font-bold text-xs px-4 rounded-xl transition uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md"
                  >
                    {isFetching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-red-200" />
                    )}
                    Analyze
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Shared Storage Preference Section */}
          <div className="pt-3 border-t border-slate-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                Storage Destination
              </span>
              <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setStorageType("local")}
                  className={`px-3 py-1 text-[9px] font-black uppercase rounded-md transition cursor-pointer tracking-wider ${
                    storageType === "local"
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Local Storage
                </button>
                <button
                  type="button"
                  onClick={() => setStorageType("drive")}
                  className={`px-3 py-1 text-[9px] font-black uppercase rounded-md transition cursor-pointer tracking-wider flex items-center gap-1 ${
                    storageType === "drive"
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <Cloud className="w-3 h-3" />
                  Google Drive
                </button>
              </div>
            </div>

            {/* Status Indicator based on storage choice */}
            {storageType === "local" ? (
              <div className="p-2 bg-slate-950/40 rounded-xl border border-slate-800 flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[9px] text-slate-400 font-medium">
                  Saving offline to browser storage (Standard Default)
                </span>
              </div>
            ) : (
              <div className="p-2 bg-slate-950/40 rounded-xl border border-slate-800 space-y-2">
                {user ? (
                  <div className="flex items-center justify-between text-[9px]">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      Authenticated
                    </div>
                    <span className="text-slate-400 truncate max-w-[200px]" title={user.email || ""}>
                      Synced Folder: <strong className="font-mono text-slate-200">the90s_Breeze/</strong>
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-[9px] text-amber-400 font-semibold flex items-center gap-1 leading-normal">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      Google Sign-In required to write folders & files to your Google Drive.
                    </p>
                    <button
                      type="button"
                      onClick={onGoogleSignIn}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9px] uppercase tracking-widest rounded-lg transition shadow-sm cursor-pointer border border-indigo-500/30 flex items-center justify-center gap-1"
                    >
                      <Cloud className="w-3 h-3" />
                      Authorize Google Drive
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Real-time Fetch pipeline logging UI */}
          {isFetching && (
            <div className="p-4.5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                  Processing Video
                </span>
                <span className="text-[9px] font-mono text-slate-500">
                  {Math.round(((fetchStep + 1) / fetchSteps.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-red-500 h-full transition-all duration-1000 ease-out"
                  style={{ width: `${((fetchStep + 1) / fetchSteps.length) * 100}%` }}
                />
              </div>
              <p className="text-[10px] font-mono text-slate-300 font-medium leading-relaxed italic animate-pulse">
                {fetchSteps[fetchStep]}
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-rose-950/20 rounded-xl border border-rose-500/20 text-rose-300 text-[10px] font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="leading-normal">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Saved Items Database Card */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Saved Hooks Library
              </h4>
            </div>
            {storageType === "drive" && user && (
              <button
                onClick={syncGoogleDrive}
                disabled={loadingDriveFiles}
                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition cursor-pointer"
                title="Refresh Google Drive files"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDriveFiles ? "animate-spin" : ""}`} />
              </button>
            )}
          </div>

          {/* Saved elements files representation */}
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {storageType === "local" ? (
              localAssets.length === 0 ? (
                <div className="text-center py-6 text-[10px] text-slate-500 italic">
                  No offline assets created yet.
                </div>
              ) : (
                localAssets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => handleLoadAsset(asset)}
                    className="group flex items-center justify-between p-2.5 bg-slate-950 hover:bg-slate-800/80 rounded-xl border border-slate-800/60 cursor-pointer transition"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="text-[10px] font-bold text-slate-200 truncate group-hover:text-white">
                        {asset.title}
                      </p>
                      <p className="text-[8px] font-mono text-slate-500 mt-0.5 uppercase tracking-wider">
                        {asset.movie} ({asset.year}) • {formatTime(asset.hookStart)}-{formatTime(asset.hookEnd)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteLocalAsset(asset.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg transition duration-200 cursor-pointer"
                      title="Delete offline asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )
            ) : !user ? (
              <div className="text-center py-6 text-[10px] text-slate-500 italic">
                Authorize Google Drive to view cloud files.
              </div>
            ) : loadingDriveFiles ? (
              <div className="text-center py-6 text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                Retrieving Drive index...
              </div>
            ) : driveFiles.length === 0 ? (
              <div className="text-center py-6 text-[10px] text-slate-500 italic">
                No files found in 'the90s_Breeze' folder on Google Drive.
              </div>
            ) : (
              driveFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => handleLoadDriveAsset(file.id)}
                  className="group flex items-center justify-between p-2.5 bg-slate-950 hover:bg-slate-800/80 rounded-xl border border-slate-800/60 cursor-pointer transition"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="text-[10px] font-bold text-slate-200 truncate group-hover:text-white">
                      {file.name}
                    </p>
                    <p className="text-[8px] font-mono text-slate-500 mt-0.5 uppercase tracking-wider">
                      Created: {new Date(file.createdTime).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteDriveAsset(file.id, file.name, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg transition duration-200 cursor-pointer"
                    title="Delete Drive asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Right Visual Looper & Content Analysis Panel (Grid Span 7) */}
      <div className="xl:col-span-7">
        {analyzedData ? (
          <div className="space-y-6">
            
            {/* Real Looping Player Card */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      Timeless Loop Screen
                      {loopEnabled && (
                        <span className="px-1.5 py-0.5 text-[8px] font-mono bg-red-950/60 text-red-400 border border-red-500/20 rounded font-black tracking-widest animate-pulse">
                          LOOP ON
                        </span>
                      )}
                    </h4>
                  </div>
                </div>

                {/* Looping controls */}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={loopEnabled}
                      onChange={(e) => setLoopEnabled(e.target.checked)}
                      className="accent-red-500 rounded cursor-pointer"
                    />
                    Infinite Hook Loop
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">
                    Range: <strong className="text-slate-300">{formatTime(loopStart)} - {formatTime(loopEnd)}</strong>
                  </span>
                </div>
              </div>

              {/* YouTube Native Video IFrame Container */}
              <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-inner border border-slate-950">
                <div id="youtube-looper-iframe" className="absolute inset-0 w-full h-full" />
                
                {!isPlayerReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-400 space-y-2 z-10">
                    <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                    <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Loading YouTube Codecs...</p>
                  </div>
                )}
              </div>

              {/* Player Status Info bar */}
              <div className="flex items-center justify-between px-2 text-[9px] font-mono text-slate-400 pb-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Interactive Audio Sync Active</span>
                </div>
                <span>
                  Elapsed Time: <strong className="text-slate-200">{formatTime(currentTime)}</strong>
                </span>
              </div>

              {/* Gemini AI Interactive Loop Adjustment Panel */}
              <div className="border-t border-slate-800/80 pt-4 space-y-4" id="gemini-loop-proposal-adjuster">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    <span>Gemini AI Proposed Hook Adjuster</span>
                  </div>
                  <span className="text-[10px] bg-indigo-950/40 text-indigo-400 px-2 py-0.5 border border-indigo-900/60 rounded-full font-bold">
                    Interactive Fine-Tuning
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Start Point */}
                  <div className="space-y-1.5 p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Loop Start Timestamp</span>
                      <span className="text-indigo-400 font-mono font-bold">{formatTime(loopStart)} ({loopStart}s)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => adjustLoopStart(-5)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-mono cursor-pointer transition"
                      >
                        -5s
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustLoopStart(-1)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-mono cursor-pointer transition"
                      >
                        -1s
                      </button>
                      <input
                        type="range"
                        min="0"
                        max={Math.max(10, loopEnd - 1)}
                        value={loopStart}
                        onChange={(e) => setLoopStart(Number(e.target.value))}
                        className="flex-1 accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => adjustLoopStart(1)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-mono cursor-pointer transition"
                      >
                        +1s
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustLoopStart(5)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-mono cursor-pointer transition"
                      >
                        +5s
                      </button>
                    </div>
                  </div>

                  {/* End Point */}
                  <div className="space-y-1.5 p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Loop End Timestamp</span>
                      <span className="text-indigo-400 font-mono font-bold">{formatTime(loopEnd)} ({loopEnd}s)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => adjustLoopEnd(-5)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-mono cursor-pointer transition"
                      >
                        -5s
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustLoopEnd(-1)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-mono cursor-pointer transition"
                      >
                        -1s
                      </button>
                      <input
                        type="range"
                        min={loopStart + 1}
                        max={Math.max(loopStart + 120, loopEnd + 30)}
                        value={loopEnd}
                        onChange={(e) => setLoopEnd(Number(e.target.value))}
                        className="flex-1 accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => adjustLoopEnd(1)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-mono cursor-pointer transition"
                      >
                        +1s
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustLoopEnd(5)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-mono cursor-pointer transition"
                      >
                        +5s
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 bg-slate-950/40 px-3 py-2 rounded-xl border border-slate-800/60">
                  <span className="text-[10px] text-slate-400">
                    💡 Seek and preview your custom hook range instantly:
                  </span>
                  <button
                    type="button"
                    onClick={triggerSeekToLoopStart}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition shadow"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    Test & Play Loop
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Marketing & Video Elements Card */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-5">
              
              {/* Media Title Details */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-white">{analyzedData.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                    🎬 Movie: <strong className="text-slate-200">{analyzedData.movie}</strong> ({analyzedData.year}) • 🎤 Singers: <strong className="text-slate-200">{analyzedData.singers}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleSaveAsset}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition shadow-sm"
                  >
                    {saveSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5 text-indigo-400" />
                        Save to {storageType === "local" ? "Offline" : "Drive"}
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleAddToActiveQueue}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition shadow-md"
                  >
                    <Calendar className="w-3.5 h-3.5 text-indigo-200" />
                    Queue to Schedule
                  </button>
                </div>
              </div>

              {/* Grid for Lyrics & Caption */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Regional Lyrics snippet */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      Nostalgic Hook Lyrics
                    </span>
                    <button
                      onClick={() => copyToClipboard(analyzedData.lyricsSnippet, "lyrics")}
                      className="text-slate-500 hover:text-slate-300 p-1 rounded transition cursor-pointer"
                      title="Copy Hook Lyrics"
                    >
                      {copiedLyrics ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 min-h-[140px] flex flex-col justify-between">
                    <p className="text-[11px] text-white leading-relaxed whitespace-pre-line font-medium italic">
                      {analyzedData.lyricsSnippet}
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-800/80">
                      <p className="text-[9px] text-indigo-400 font-bold tracking-wider uppercase font-mono">English Poetic translation</p>
                      <p className="text-[10px] text-slate-400 leading-snug mt-1 italic">
                        {analyzedData.translatedLyrics}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Engaging Instagram Caption */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      Viral Reels Caption
                    </span>
                    <button
                      onClick={() => copyToClipboard(analyzedData.caption, "caption")}
                      className="text-slate-500 hover:text-slate-300 p-1 rounded transition cursor-pointer"
                      title="Copy Reels Caption"
                    >
                      {copiedCaption ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 h-[140px] overflow-y-auto">
                    <p className="text-[10px] text-slate-300 leading-relaxed whitespace-pre-line">
                      {analyzedData.caption}
                    </p>
                  </div>
                </div>

              </div>

              {/* Core visual properties info block */}
              <div className="p-3 bg-indigo-950/20 border border-indigo-500/15 rounded-xl flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-indigo-300">Aesthetic Recommendation Match</p>
                  <p className="text-[10px] text-slate-400">
                    Mood: <strong className="text-slate-300">{analyzedData.mood}</strong> • Stock overlay: <strong className="text-slate-300">{analyzedData.vibes}</strong>
                  </p>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="h-full min-h-[400px] border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-slate-900/10">
            <Tv className="w-10 h-10 text-slate-700 mb-3" />
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              No Video Indexed Yet
            </h4>
            <p className="text-[11px] text-slate-500 max-w-sm mt-1">
              Input a YouTube URL on the left panel. The content pipeline will parse, index, find the exact high-retention viral hook, and generate beautiful visuals for loop play!
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
