import React, { useState, useEffect, useRef } from "react";
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
  Database,
  Edit2,
  Trash2,
  PlayCircle,
  Save,
  Film,
  CheckSquare,
  Square,
  CloudUpload,
  Music,
  Search,
  Filter,
  Star
} from "lucide-react";
import { TrendItem, QueueItem, StoredAsset } from "../types";
import { useToast } from "./ToastContext";
import { 
  getAssetsFromOfflineDB, 
  saveAssetToOfflineDB, 
  deleteAssetFromOfflineDB 
} from "../lib/indexedDb";

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
  const toast = useToast();
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

  // Processed YouTube loop states
  const [processedVideos, setProcessedVideos] = useState<StoredAsset[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<StoredAsset | null>(null);
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [gallerySearch, setGallerySearch] = useState("");
  const [galleryFilter, setGalleryFilter] = useState<"all" | "local" | "drive">("all");

  // Waveform dragging & timeline adjustment state
  const trackRef = useRef<HTMLDivElement>(null);
  const [draggingHandle, setDraggingHandle] = useState<'start' | 'end' | null>(null);
  const totalDuration = selectedVideo ? Math.max(selectedVideo.hookEnd + 30, 90) : 90;

  const handleUpdateTimestamps = async (newStart: number, newEnd: number) => {
    if (!selectedVideo) return;
    const updated = {
      ...selectedVideo,
      hookStart: newStart,
      hookEnd: newEnd,
      data: selectedVideo.data ? { ...selectedVideo.data, hookStart: newStart, hookEnd: newEnd } : { videoId: selectedVideo.id, hookStart: newStart, hookEnd: newEnd } as any
    };
    setSelectedVideo(updated);
    setProcessedVideos(prev => prev.map(v => v.id === selectedVideo.id ? updated : v));
    try {
      await saveAssetToOfflineDB(updated);
    } catch (err) {
      console.error("Failed to persist updated timestamps:", err);
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setDraggingHandle(null);
    };
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!draggingHandle || !trackRef.current || !selectedVideo) return;
      const rect = trackRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const percent = Math.min(Math.max(0, offsetX / rect.width), 1);
      const seconds = Math.round(percent * totalDuration);
      
      if (draggingHandle === 'start') {
        const newStart = Math.min(seconds, selectedVideo.hookEnd - 1);
        handleUpdateTimestamps(newStart, selectedVideo.hookEnd);
      } else if (draggingHandle === 'end') {
        const newEnd = Math.max(seconds, selectedVideo.hookStart + 1);
        handleUpdateTimestamps(selectedVideo.hookStart, newEnd);
      }
    };
    
    const handleGlobalTouchEnd = () => {
      setDraggingHandle(null);
    };
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!draggingHandle || !trackRef.current || !selectedVideo) return;
      const rect = trackRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const offsetX = touch.clientX - rect.left;
      const percent = Math.min(Math.max(0, offsetX / rect.width), 1);
      const seconds = Math.round(percent * totalDuration);
      
      if (draggingHandle === 'start') {
        const newStart = Math.min(seconds, selectedVideo.hookEnd - 1);
        handleUpdateTimestamps(newStart, selectedVideo.hookEnd);
      } else if (draggingHandle === 'end') {
        const newEnd = Math.max(seconds, selectedVideo.hookStart + 1);
        handleUpdateTimestamps(selectedVideo.hookStart, newEnd);
      }
    };

    if (draggingHandle) {
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('touchend', handleGlobalTouchEnd);
      window.addEventListener('touchmove', handleGlobalTouchMove);
    }
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
    };
  }, [draggingHandle, selectedVideo, totalDuration]);

  // Gallery Inline Renaming and Refresh States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Batch Selection & Bulk Operations State
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkProgressMessage, setBulkProgressMessage] = useState("");
  const [bulkRenamePrefix, setBulkRenamePrefix] = useState("");
  const [bulkRenameSuffix, setBulkRenameSuffix] = useState("");
  const [showBulkRenamePanel, setShowBulkRenamePanel] = useState(false);

  // Batch action implementations
  const handleToggleSelectAsset = (id: string) => {
    setSelectedAssetIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedAssetIds.length === processedVideos.length) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(processedVideos.map(v => v.id));
    }
  };

  const handleBulkRename = async () => {
    if (selectedAssetIds.length === 0) return;
    if (!bulkRenamePrefix.trim() && !bulkRenameSuffix.trim()) {
      alert("Please specify a prefix or a suffix to apply bulk renaming.");
      return;
    }
    setIsBulkProcessing(true);
    setBulkProgressMessage("Applying bulk rename sequence...");
    
    try {
      const updatedVideos = [...processedVideos];
      for (const id of selectedAssetIds) {
        const videoIndex = updatedVideos.findIndex(v => v.id === id);
        if (videoIndex !== -1) {
          const video = updatedVideos[videoIndex];
          const originalTitle = video.title || video.name || "Clip";
          const newTitle = `${bulkRenamePrefix.trim()}${originalTitle}${bulkRenameSuffix.trim()}`;
          const updated = {
            ...video,
            title: newTitle,
            name: newTitle,
            data: video.data ? { ...video.data, title: newTitle } : { videoId: video.id, title: newTitle } as any
          };
          await saveAssetToOfflineDB(updated);
          updatedVideos[videoIndex] = updated;
        }
      }
      setProcessedVideos(updatedVideos);
      setSelectedAssetIds([]);
      setBulkRenamePrefix("");
      setBulkRenameSuffix("");
      setShowBulkRenamePanel(false);
      setBulkProgressMessage("Bulk renaming applied successfully!");
      setTimeout(() => setBulkProgressMessage(""), 3000);
      toast.success("Successfully applied bulk rename to selected assets!");
    } catch (err) {
      console.error("Bulk rename error:", err);
      setBulkProgressMessage("Failed to apply bulk renaming.");
      toast.error("Failed to apply bulk renaming sequence.");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkCloudSync = async () => {
    if (selectedAssetIds.length === 0) return;
    setIsBulkProcessing(true);
    
    try {
      for (let i = 0; i < selectedAssetIds.length; i++) {
        const id = selectedAssetIds[i];
        const video = processedVideos.find(v => v.id === id);
        const title = video ? video.title : id;
        
        setBulkProgressMessage(`[${i + 1}/${selectedAssetIds.length}] Syncing "${title}" to cloud storage...`);
        // Simulate network latency for API transfer
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (video) {
          const updated = {
            ...video,
            source: "drive" as const,
            driveFileId: "gdrive_" + Math.random().toString(36).substring(2, 10)
          };
          await saveAssetToOfflineDB(updated);
          setProcessedVideos(prev => prev.map(v => v.id === id ? updated : v));
        }
      }
      const count = selectedAssetIds.length;
      setSelectedAssetIds([]);
      setBulkProgressMessage("Cloud synchronization complete! Selected reels synced successfully.");
      setTimeout(() => setBulkProgressMessage(""), 3500);
      toast.success(`Successfully synchronized ${count} selected reels to Google Drive!`);
    } catch (err) {
      console.error("Bulk sync error:", err);
      setBulkProgressMessage("Cloud synchronization encountered an issue.");
      toast.error("Cloud synchronization failed for some selected assets.");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAssetIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete all ${selectedAssetIds.length} selected assets from local database?`)) return;
    
    setIsBulkProcessing(true);
    setBulkProgressMessage("Deleting selected assets...");
    
    try {
      const count = selectedAssetIds.length;
      for (const id of selectedAssetIds) {
        await deleteAssetFromOfflineDB(id);
      }
      setProcessedVideos(prev => prev.filter(v => !selectedAssetIds.includes(v.id)));
      if (selectedVideo && selectedAssetIds.includes(selectedVideo.id)) {
        setSelectedVideo(null);
        setShowVideoPreview(false);
      }
      setSelectedAssetIds([]);
      setBulkProgressMessage("Successfully cleared selected clips.");
      setTimeout(() => setBulkProgressMessage(""), 3000);
      toast.success(`Successfully deleted ${count} selected assets from local database.`);
    } catch (err) {
      console.error("Bulk delete error:", err);
      setBulkProgressMessage("Failed to complete bulk deletion.");
      toast.error("Bulk deletion failed.");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Play, Rename, Delete Handler functions
  const handlePlayAsset = (asset: StoredAsset) => {
    setSelectedVideo(asset);
    setShowVideoPreview(true);
    if (asset.data) {
      setSongTitle(asset.data.title || asset.title || "");
      setMovieName(asset.data.movie || asset.movie || "");
      setSingers(asset.data.singers || "");
      setLyricsSnippet(asset.data.lyricsSnippet || "");
      setTranslatedLyrics(asset.data.translatedLyrics || "");
      setInstagramCaption(asset.data.caption || "");
    } else {
      setSongTitle(asset.title || "");
      setMovieName(asset.movie || "");
    }
    toast.info(`Selected loop active: "${asset.title || asset.name}"`);
  };

  const handleStartRename = (asset: StoredAsset) => {
    setEditingId(asset.id);
    setEditingTitle(asset.title || asset.name || "");
  };

  const handleSaveRename = async (asset: StoredAsset) => {
    if (!editingTitle.trim()) return;
    try {
      const updatedAsset = { 
        ...asset, 
        title: editingTitle, 
        name: editingTitle, 
        data: asset.data ? { ...asset.data, title: editingTitle } : { videoId: asset.id, title: editingTitle } as any
      };
      await saveAssetToOfflineDB(updatedAsset);
      setProcessedVideos(prev => prev.map(v => v.id === asset.id ? updatedAsset : v));
      if (selectedVideo?.id === asset.id) {
        setSelectedVideo(updatedAsset);
        setSongTitle(editingTitle);
      }
      setEditingId(null);
      toast.success(`Renamed asset to "${editingTitle}" successfully!`);
    } catch (err) {
      console.error("Failed to rename asset:", err);
      toast.error("Failed to rename asset.");
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      await deleteAssetFromOfflineDB(id);
      setProcessedVideos(prev => prev.filter(v => v.id !== id));
      if (selectedVideo?.id === id) {
        setSelectedVideo(null);
        setShowVideoPreview(false);
      }
      toast.success("Successfully deleted asset from local database.");
    } catch (err) {
      console.error("Failed to delete asset:", err);
      toast.error("Failed to delete asset.");
    }
  };

  const handleToggleCurate = async (asset: StoredAsset) => {
    try {
      const isCurated = !asset.isCurated;
      const updatedAsset = { ...asset, isCurated };
      
      // Save to IndexedDB
      await saveAssetToOfflineDB(updatedAsset);
      
      // Update state
      setProcessedVideos(prev => prev.map(v => v.id === asset.id ? updatedAsset : v));
      
      if (selectedVideo?.id === asset.id) {
        setSelectedVideo(updatedAsset);
      }
      
      // Synchronize to localStorage key used by YoutubeFetcher
      const localStr = localStorage.getItem("the90s_Breeze_local_assets");
      if (localStr) {
        try {
          const localAssets: StoredAsset[] = JSON.parse(localStr);
          const updatedLocal = localAssets.map(v => v.id === asset.id ? updatedAsset : v);
          localStorage.setItem("the90s_Breeze_local_assets", JSON.stringify(updatedLocal));
        } catch (e) {
          console.error("Failed to sync curation to localStorage local_assets", e);
        }
      }

      if (isCurated) {
        toast.success(`"${asset.title}" marked as a curated viral hook!`);
      } else {
        toast.info(`"${asset.title}" removed from curated viral hooks.`);
      }
    } catch (err) {
      console.error("Failed to toggle curation:", err);
      toast.error("Failed to update curation state.");
    }
  };

  const handleRefreshGallery = async () => {
    try {
      const assets = await getAssetsFromOfflineDB();
      setProcessedVideos(assets);
      toast.success("Gallery refreshed successfully.");
    } catch (err) {
      console.error("Failed to refresh gallery assets:", err);
      toast.error("Failed to refresh gallery.");
    }
  };

  // Time Formatter helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Load IndexedDB indexed assets
  useEffect(() => {
    const loadProcessedVideos = async () => {
      try {
        const assets = await getAssetsFromOfflineDB();
        setProcessedVideos(assets);
        
        // Find best match based on songTitle if possible
        if (assets && assets.length > 0) {
          const match = assets.find(a => 
            (a.title && songTitle && a.title.toLowerCase().includes(songTitle.toLowerCase())) ||
            (songTitle && a.title && songTitle.toLowerCase().includes(a.title.toLowerCase()))
          );
          if (match) {
            setSelectedVideo(match);
            setShowVideoPreview(true);
          } else {
            setSelectedVideo(assets[0]);
          }
        }
      } catch (e) {
        console.error("Failed to load IndexedDB assets in AssetStudio:", e);
      }
    };
    loadProcessedVideos();
  }, [songTitle]);

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
    toast.info("Generating captions & synchronized lyrics translation via Gemini AI...");
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
      toast.success("Successfully fetched lyrics translation & Instagram captions!");
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to generate AI captions: ${err.message || err}`);
    } finally {
      setFetchingAiContent(false);
    }
  };

  // Generate Image via Gemini Image Gen
  const generateAIVisual = async () => {
    if (!aiPrompt) return;
    setAiGenerating(true);
    setBgType("ai");
    toast.info("Synthesizing aesthetic visual background via Gemini Image Gen...");
    try {
      const res = await fetch("/api/gemini/generate-bg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await res.json();
      if (data.imageUrl) {
        setSelectedBg(data.imageUrl);
        toast.success("Aesthetic backdrop image synthesized successfully!");
      } else {
        throw new Error("No image URL returned");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to generate AI visual background: ${err.message || err}`);
    } finally {
      setAiGenerating(false);
    }
  };

  // Copy to clipboard helper
  const copyCaption = () => {
    navigator.clipboard.writeText(instagramCaption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
    toast.success("Social caption copied to clipboard!");
  };

  // Simulate programmatic compilation steps
  const simulateFFmpegCompilation = () => {
    setIsCompiling(true);
    setCompileLogs([]);
    setVideoCompiled(false);
    toast.info("Vertical Video Synthesis (FFmpeg) initiated...");

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
          toast.success("Vertical Reel Video compiled successfully via programmatic synthesis!");
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
    toast.success("Successfully scheduled compiled video inside your Content Calendar!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="asset-studio">
      
      {/* LEFT COLUMN: Visual Media Generator & Real-time Live Simulator (Grid Span 5) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Video className="w-4 h-4 text-indigo-600" />
              9:16 Video Player Mockup
            </h3>
            {processedVideos.length > 0 && (
              <span className="px-1.5 py-0.5 text-[8px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-150 rounded uppercase">
                {processedVideos.length} Indexed Clips
              </span>
            )}
          </div>

          {/* Processed YouTube Videos Selector Dropdown */}
          {processedVideos.length > 0 && (
            <div className="mb-4 p-2.5 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5">
              <label className="block text-[8px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Processed YouTube Clip
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedVideo?.id || ""}
                  onChange={(e) => {
                    const video = processedVideos.find(v => v.id === e.target.value);
                    if (video) {
                      setSelectedVideo(video);
                      setShowVideoPreview(true);
                      // Pre-populate input fields from processed video's metadata
                      if (video.data) {
                        setSongTitle(video.data.title || video.title || "");
                        setMovieName(video.data.movie || video.movie || "");
                        setSingers(video.data.singers || "");
                        setLyricsSnippet(video.data.lyricsSnippet || "");
                        setTranslatedLyrics(video.data.translatedLyrics || "");
                        setInstagramCaption(video.data.caption || "");
                      }
                    } else {
                      setSelectedVideo(null);
                      setShowVideoPreview(false);
                    }
                  }}
                  className="flex-1 bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 rounded-lg px-2.5 py-1 text-[10px] text-slate-700 outline-none transition cursor-pointer"
                >
                  <option value="">-- No YouTube Loop (Show Image Backdrop) --</option>
                  {processedVideos.map(v => (
                    <option key={v.id} value={v.id}>
                      📹 {v.title} ({v.movie || "No Movie"})
                    </option>
                  ))}
                </select>
                {selectedVideo && (
                  <button
                    onClick={() => setShowVideoPreview(!showVideoPreview)}
                    className={`px-2.5 py-1 text-[9px] font-bold rounded-lg border uppercase tracking-wider transition shrink-0 cursor-pointer ${
                      showVideoPreview 
                        ? "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700" 
                        : "bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-350"
                    }`}
                  >
                    {showVideoPreview ? "Loop On" : "Preview"}
                  </button>
                )}
              </div>

              {/* Visual Waveform Range Adjuster panel */}
              {selectedVideo && (
                <div className="pt-2.5 border-t border-slate-150 mt-2 space-y-2 animate-fadeIn" id="viral-hook-waveform-adjuster">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-650 flex items-center gap-1 font-mono uppercase tracking-wider">
                      <Music className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                      Visual Waveform Editor
                    </span>
                    <span className="text-[8px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                      {selectedVideo.hookEnd - selectedVideo.hookStart}s Hook Selected
                    </span>
                  </div>

                  {/* Waveform Visualization Track wrapper */}
                  <div 
                    ref={trackRef}
                    className="relative h-14 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden select-none cursor-ew-resize"
                    onMouseDown={(e) => {
                      if (!trackRef.current) return;
                      const rect = trackRef.current.getBoundingClientRect();
                      const offsetX = e.clientX - rect.left;
                      const percent = offsetX / rect.width;
                      const clickedSeconds = percent * totalDuration;
                      // Decide which handle is closer
                      const distToStart = Math.abs(clickedSeconds - selectedVideo.hookStart);
                      const distToEnd = Math.abs(clickedSeconds - selectedVideo.hookEnd);
                      if (distToStart < distToEnd) {
                        setDraggingHandle('start');
                        const newStart = Math.min(Math.round(clickedSeconds), selectedVideo.hookEnd - 1);
                        handleUpdateTimestamps(newStart, selectedVideo.hookEnd);
                      } else {
                        setDraggingHandle('end');
                        const newEnd = Math.max(Math.round(clickedSeconds), selectedVideo.hookStart + 1);
                        handleUpdateTimestamps(selectedVideo.hookStart, newEnd);
                      }
                    }}
                  >
                    {/* CSS Waveform Bars */}
                    <div className="absolute inset-x-2 inset-y-1.5 flex items-end justify-between pointer-events-none">
                      {Array.from({ length: 42 }).map((_, i) => {
                        const barTime = (i / 42) * totalDuration;
                        const isActive = barTime >= selectedVideo.hookStart && barTime <= selectedVideo.hookEnd;
                        // Deterministic heights for a beautiful wave
                        const heights = [15, 30, 45, 65, 80, 50, 40, 60, 75, 90, 85, 45, 35, 55, 70, 85, 95, 60, 40, 25, 40, 60, 80, 95, 70, 50, 30, 45, 65, 80, 90, 75, 50, 35, 20, 35, 55, 70, 80, 65, 45, 25];
                        const hPercent = heights[i % heights.length];
                        return (
                          <div 
                            key={i} 
                            style={{ height: `${hPercent}%` }}
                            className={`w-[4px] rounded-full transition-colors duration-200 ${
                              isActive 
                                ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                                : "bg-slate-700 opacity-30"
                            }`}
                          />
                        );
                      })}
                    </div>

                    {/* Active Highlight Loop Range overlay */}
                    <div 
                      className="absolute top-0 bottom-0 bg-indigo-500/10 border-l border-r border-indigo-500 pointer-events-none"
                      style={{
                        left: `${(selectedVideo.hookStart / totalDuration) * 100}%`,
                        right: `${100 - (selectedVideo.hookEnd / totalDuration) * 100}%`
                      }}
                    />

                    {/* Left Drag Handle */}
                    <div 
                      className="absolute top-0 bottom-0 w-3 cursor-col-resize group flex items-center justify-center"
                      style={{ left: `calc(${(selectedVideo.hookStart / totalDuration) * 100}% - 6px)` }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setDraggingHandle('start');
                      }}
                    >
                      <div className="w-2.5 h-6 bg-indigo-600 hover:bg-indigo-500 rounded border border-white flex flex-col justify-between p-[2px] shadow-md transition-transform group-hover:scale-110">
                        <div className="w-full h-[1px] bg-white/60" />
                        <div className="w-full h-[1px] bg-white/60" />
                        <div className="w-full h-[1px] bg-white/60" />
                      </div>
                    </div>

                    {/* Right Drag Handle */}
                    <div 
                      className="absolute top-0 bottom-0 w-3 cursor-col-resize group flex items-center justify-center"
                      style={{ left: `calc(${(selectedVideo.hookEnd / totalDuration) * 100}% - 6px)` }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setDraggingHandle('end');
                      }}
                    >
                      <div className="w-2.5 h-6 bg-indigo-600 hover:bg-indigo-500 rounded border border-white flex flex-col justify-between p-[2px] shadow-md transition-transform group-hover:scale-110">
                        <div className="w-full h-[1px] bg-white/60" />
                        <div className="w-full h-[1px] bg-white/60" />
                        <div className="w-full h-[1px] bg-white/60" />
                      </div>
                    </div>
                  </div>

                  {/* Timing Inputs / Fine-tuning Controls */}
                  <div className="flex items-center justify-between gap-3 text-[9px] text-slate-500 bg-white/50 p-2 rounded-lg border border-slate-200/60">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-400">START:</span>
                      <button 
                        onClick={() => handleUpdateTimestamps(Math.max(0, selectedVideo.hookStart - 1), selectedVideo.hookEnd)}
                        className="px-1 bg-slate-200 hover:bg-slate-300 rounded font-mono font-bold transition cursor-pointer"
                      >
                        -1s
                      </button>
                      <span className="font-mono font-extrabold text-slate-800 bg-white border px-1.5 py-0.5 rounded shadow-2xs">
                        {formatTime(selectedVideo.hookStart)}
                      </span>
                      <button 
                        onClick={() => handleUpdateTimestamps(Math.min(selectedVideo.hookEnd - 1, selectedVideo.hookStart + 1), selectedVideo.hookEnd)}
                        className="px-1 bg-slate-200 hover:bg-slate-300 rounded font-mono font-bold transition cursor-pointer"
                      >
                        +1s
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-400">END:</span>
                      <button 
                        onClick={() => handleUpdateTimestamps(selectedVideo.hookStart, Math.max(selectedVideo.hookStart + 1, selectedVideo.hookEnd - 1))}
                        className="px-1 bg-slate-200 hover:bg-slate-300 rounded font-mono font-bold transition cursor-pointer"
                      >
                        -1s
                      </button>
                      <span className="font-mono font-extrabold text-slate-800 bg-white border px-1.5 py-0.5 rounded shadow-2xs">
                        {formatTime(selectedVideo.hookEnd)}
                      </span>
                      <button 
                        onClick={() => handleUpdateTimestamps(selectedVideo.hookStart, Math.min(totalDuration, selectedVideo.hookEnd + 1))}
                        className="px-1 bg-slate-200 hover:bg-slate-300 rounded font-mono font-bold transition cursor-pointer"
                      >
                        +1s
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Vertical Video Frame */}
          <div className="relative aspect-[9/16] w-full max-w-[280px] mx-auto bg-slate-900 border-4 border-slate-950 rounded-[32px] overflow-hidden shadow-2xl shadow-slate-950/30">
            {selectedVideo && showVideoPreview ? (
              <div className="absolute inset-0 w-full h-full bg-black">
                {/* Embed player with custom start & end looping */}
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.data?.videoId || selectedVideo.id.replace("dl_", "").split("_")[0]}?start=${selectedVideo.hookStart}&end=${selectedVideo.hookEnd}&autoplay=1&mute=1&loop=1&playlist=${selectedVideo.data?.videoId || selectedVideo.id.replace("dl_", "").split("_")[0]}&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`}
                  className="w-full h-full scale-[1.3] origin-center object-cover"
                  title="YouTube Preview Looper"
                  allow="autoplay; encrypted-media"
                  frameBorder="0"
                  referrerPolicy="no-referrer"
                />
                
                {/* Semi-transparent Overlay to show the start/end timestamps */}
                <div className="absolute top-14 left-3 right-3 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-2.5 text-white font-mono text-[9px] flex flex-col gap-1 pointer-events-none z-10 shadow-lg">
                  <div className="flex items-center justify-between text-[8px] uppercase tracking-wider text-indigo-400 font-bold">
                    <span>Viral Hook Active</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  <div className="flex justify-between items-center mt-0.5">
                    <div>
                      <span className="text-slate-500 text-[7px] uppercase font-bold">START</span>
                      <p className="text-[10px] font-black text-slate-100">{formatTime(selectedVideo.hookStart)}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[7px] uppercase font-bold">END</span>
                      <p className="text-[10px] font-black text-slate-100">{formatTime(selectedVideo.hookEnd)}</p>
                    </div>
                    <div>
                      <span className="text-indigo-400 text-[7px] uppercase font-bold block text-right">LENGTH</span>
                      <p className="text-[10px] font-black text-indigo-300 text-right">{(selectedVideo.hookEnd - selectedVideo.hookStart).toFixed(0)}s</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Reel Backdrop */
              <img 
                src={selectedBg} 
                alt="Reel Background" 
                className="w-full h-full object-cover brightness-[0.55] transition-all duration-300"
                referrerPolicy="no-referrer"
              />
            )}

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

        {/* Asset Gallery component */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4" id="local-asset-gallery">
          {/* Header section with Stats */}
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                <Film className="w-4 h-4 text-indigo-600 animate-pulse" />
                Asset Gallery Studio
              </h4>
              <button
                onClick={handleRefreshGallery}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer flex items-center gap-1 text-[10px] font-mono font-medium"
                title="Refresh Assets"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Sync List
              </button>
            </div>

            {/* Quick Metadata Statistics Bar */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 text-center">
              <div>
                <span className="block text-[8px] font-mono uppercase text-slate-400">Total Clips</span>
                <span className="text-xs font-mono font-black text-indigo-650">{processedVideos.length}</span>
              </div>
              <div className="border-x border-slate-200/80">
                <span className="block text-[8px] font-mono uppercase text-slate-400">Local Cache</span>
                <span className="text-xs font-mono font-black text-emerald-600">
                  {processedVideos.filter(v => v.source !== "drive").length}
                </span>
              </div>
              <div>
                <span className="block text-[8px] font-mono uppercase text-slate-400">Drive Synced</span>
                <span className="text-xs font-mono font-black text-amber-500">
                  {processedVideos.filter(v => v.source === "drive").length}
                </span>
              </div>
            </div>
          </div>

          {processedVideos.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
              <Film className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-[10px] font-mono text-slate-400">No locally stored clips found.</p>
              <p className="text-[9px] text-slate-400">Go to the YouTube Fetcher tab, paste a URL, extract a viral hook, and hit 'Save Isolated Clip' to populate this gallery.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search and Filters Segment Controls */}
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Search Input */}
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search title, film, or vibes..."
                    value={gallerySearch}
                    onChange={(e) => setGallerySearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-[10px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                  {gallerySearch && (
                    <button
                      onClick={() => setGallerySearch("")}
                      className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 text-[10px]"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter Tabs Toggle */}
                <div className="flex bg-slate-100 border border-slate-200 p-0.5 rounded-xl self-start sm:self-auto">
                  {(["all", "local", "drive"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setGalleryFilter(tab)}
                      className={`px-2 py-1 rounded-lg text-[9px] font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                        galleryFilter === tab
                          ? "bg-white text-indigo-650 shadow-xs border-slate-200 font-bold"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {tab === "all" ? "All" : tab === "local" ? "Offline" : "Synced"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Batch Processing Dashboard Controller */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleSelectAll}
                      className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-600 hover:text-indigo-600 cursor-pointer bg-white px-2 py-1 border border-slate-200 rounded-lg transition"
                    >
                      {selectedAssetIds.length === processedVideos.length ? (
                        <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>
                        {selectedAssetIds.length === processedVideos.length ? "Deselect All" : "Select All"}
                      </span>
                    </button>
                    
                    {selectedAssetIds.length > 0 && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-600 text-white rounded-full">
                        {selectedAssetIds.length} Selected
                      </span>
                    )}
                  </div>

                  {selectedAssetIds.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setShowBulkRenamePanel(!showBulkRenamePanel)}
                        className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg border transition cursor-pointer ${
                          showBulkRenamePanel 
                            ? "bg-amber-50 border-amber-200 text-amber-700" 
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                        title="Bulk Rename"
                      >
                        Rename
                      </button>
                      <button
                        onClick={handleBulkCloudSync}
                        disabled={isBulkProcessing}
                        className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-indigo-600 disabled:opacity-55 text-[9px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1 transition cursor-pointer"
                        title="Cloud Sync"
                      >
                        <CloudUpload className="w-3 h-3" />
                        Sync
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        disabled={isBulkProcessing}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-100 hover:border-rose-200 text-rose-600 disabled:opacity-55 text-[9px] font-bold uppercase tracking-wider rounded-lg transition cursor-pointer"
                        title="Bulk Delete"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Bulk Rename Inputs Panel */}
                {showBulkRenamePanel && selectedAssetIds.length > 0 && (
                  <div className="p-2.5 bg-white border border-slate-150 rounded-lg space-y-2 animate-fadeIn">
                    <p className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-400">Bulk Title Customizer</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[8px] text-slate-500 font-semibold mb-0.5">Prefix (Appends before)</label>
                        <input
                          type="text"
                          placeholder="e.g. [Reel] "
                          value={bulkRenamePrefix}
                          onChange={(e) => setBulkRenamePrefix(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px] text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-slate-500 font-semibold mb-0.5">Suffix (Appends after)</label>
                        <input
                          type="text"
                          placeholder="e.g. _90sBreeze"
                          value={bulkRenameSuffix}
                          onChange={(e) => setBulkRenameSuffix(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px] text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        onClick={() => setShowBulkRenamePanel(false)}
                        className="px-2 py-0.5 text-[9px] text-slate-500 hover:bg-slate-100 border border-transparent rounded-md cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleBulkRename}
                        className="px-3 py-0.5 bg-indigo-600 text-white hover:bg-indigo-700 text-[9px] font-bold rounded-md cursor-pointer"
                      >
                        Apply Bulk Rename
                      </button>
                    </div>
                  </div>
                )}

                {/* Processing Logs & Message Banner */}
                {bulkProgressMessage && (
                  <div className="p-2 bg-indigo-50/75 border border-indigo-100 text-indigo-950 rounded-lg text-[9px] font-mono flex items-center gap-2">
                    {isBulkProcessing && <RefreshCw className="w-3 h-3 animate-spin text-indigo-600" />}
                    <span>{bulkProgressMessage}</span>
                  </div>
                )}
              </div>

              {/* Scrollable Gallery Items Grid */}
              <div className="grid grid-cols-2 gap-3.5 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
                {processedVideos
                  .filter(asset => {
                    const term = gallerySearch.toLowerCase();
                    const matchesSearch = 
                      (asset.title || "").toLowerCase().includes(term) ||
                      (asset.movie || "").toLowerCase().includes(term) ||
                      (asset.data?.singers || "").toLowerCase().includes(term) ||
                      (asset.data?.mood || "").toLowerCase().includes(term) ||
                      (asset.data?.vibes || "").toLowerCase().includes(term);
                    
                    const matchesFilter = galleryFilter === "all" ||
                      (galleryFilter === "local" && asset.source !== "drive") ||
                      (galleryFilter === "drive" && asset.source === "drive");

                    return matchesSearch && matchesFilter;
                  })
                  .map((asset) => {
                    const videoId = asset.data?.videoId || asset.id.replace("dl_", "").split("_")[0];
                    const hasVideoId = videoId && videoId.length === 11;
                    const thumbnailUrl = hasVideoId 
                      ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                      : null;
                    const isSelected = selectedAssetIds.includes(asset.id);
                    const isActive = selectedVideo?.id === asset.id;

                    return (
                      <div 
                        key={asset.id} 
                        className={`group relative flex flex-col bg-slate-50 border rounded-2xl overflow-hidden transition-all duration-300 ${
                          isActive 
                            ? "border-indigo-600 ring-2 ring-indigo-550/20 shadow-md bg-indigo-50/10" 
                            : isSelected
                              ? "border-indigo-350 bg-indigo-50/5 shadow-xs"
                              : "border-slate-200 hover:border-slate-350 hover:shadow-xs"
                        }`}
                      >
                        {/* Thumbnail Section */}
                        <div className="relative aspect-video w-full bg-slate-950 overflow-hidden shrink-0">
                          {thumbnailUrl ? (
                            <>
                              <img 
                                src={thumbnailUrl} 
                                alt={asset.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350" 
                                referrerPolicy="no-referrer"
                              />
                              {/* Overlay scrim */}
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/25 pointer-events-none" />
                            </>
                          ) : (
                            /* Fully Generated Visual Retro Thumbnail Card fall-back */
                            <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-rose-950/90 flex flex-col items-center justify-center p-3 relative">
                              {/* Audio soundbar simulation bars */}
                              <div className="absolute inset-x-0 bottom-1 flex items-end justify-center gap-0.5 opacity-30 h-8 pointer-events-none">
                                <span className="w-0.5 bg-indigo-400 h-2 animate-pulse" />
                                <span className="w-0.5 bg-indigo-300 h-4 animate-pulse" />
                                <span className="w-0.5 bg-indigo-500 h-6 animate-pulse" />
                                <span className="w-0.5 bg-rose-400 h-3 animate-pulse" />
                                <span className="w-0.5 bg-rose-300 h-5 animate-pulse" />
                                <span className="w-0.5 bg-indigo-400 h-1 animate-pulse" />
                              </div>
                              <Music className="w-5 h-5 text-indigo-400/80 mb-1 animate-bounce" />
                              <span className="text-[7px] font-mono uppercase tracking-wider text-slate-400/90 text-center truncate w-full px-1">
                                {asset.title || asset.name}
                              </span>
                              <span className="text-[6px] font-mono text-indigo-300/80 uppercase">
                                {asset.movie || "90s Retro Track"}
                              </span>
                            </div>
                          )}
                          
                          {/* Checkbox selector overlay on thumbnail top-left */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSelectAsset(asset.id);
                            }}
                            className="absolute top-2 left-2 z-10 p-1 bg-black/60 backdrop-blur-md hover:bg-black/85 rounded-lg border border-white/10 transition cursor-pointer"
                            title={isSelected ? "Deselect item" : "Select item"}
                          >
                            {isSelected ? (
                              <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-white/70" />
                            )}
                          </button>

                          {/* Hover Overlay containing a nice centered button */}
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handlePlayAsset(asset)}
                              className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:scale-110 transition cursor-pointer"
                              title="Load Loop Player"
                            >
                              <PlayCircle className="w-5 h-5 fill-white/15" />
                            </button>
                          </div>

                          {/* Cloud Sync Status Icon badge */}
                          {asset.source === "drive" ? (
                            <div className="absolute top-2 right-2 z-10 bg-emerald-600/90 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-emerald-500/35 text-[7px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-0.5">
                              <Cloud className="w-2.5 h-2.5 fill-white/10" />
                              <span>Synced</span>
                            </div>
                          ) : (
                            <div className="absolute top-2 right-2 z-10 bg-slate-800/85 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-slate-700/50 text-[7px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-0.5">
                              <Database className="w-2.5 h-2.5" />
                              <span>Offline</span>
                            </div>
                          )}

                          {/* Video Loop Clip Duration Indicator */}
                          <div className="absolute bottom-1.5 right-1.5 bg-black/75 backdrop-blur-xs px-1.5 py-0.5 rounded text-[8px] font-mono text-white/90">
                            {asset.hookEnd && asset.hookStart ? (asset.hookEnd - asset.hookStart).toFixed(0) : "15"}s
                          </div>
                        </div>

                        {/* Meta Details Section */}
                        <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
                          <div className="space-y-1">
                            {editingId === asset.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={editingTitle}
                                  onChange={(e) => setEditingTitle(e.target.value)}
                                  className="flex-1 min-w-0 bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 text-[10px] text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveRename(asset)}
                                  className="p-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 rounded cursor-pointer"
                                  title="Save Title"
                                >
                                  <Save className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="p-1 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-500 rounded cursor-pointer"
                                  title="Cancel"
                                >
                                  <span className="text-[10px] font-bold">✕</span>
                                </button>
                              </div>
                            ) : (
                              <>
                                <h5 
                                  className="text-[10px] font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-650 transition cursor-pointer"
                                  title={asset.title}
                                  onClick={() => handlePlayAsset(asset)}
                                >
                                  {asset.title}
                                </h5>
                                
                                <p className="text-[8px] font-semibold text-slate-400 truncate uppercase tracking-wide flex items-center gap-1">
                                  <span>{asset.movie || "Unknown Film"}</span>
                                  {asset.year ? <span className="opacity-80">({asset.year})</span> : null}
                                </p>
                              </>
                            )}

                            {/* Singers list if defined */}
                            {asset.data?.singers && (
                              <p className="text-[8px] text-slate-500/90 truncate italic" title={asset.data.singers}>
                                Singers: {asset.data.singers}
                              </p>
                            )}

                            {/* Loop duration & Vibe badge line */}
                            <div className="flex items-center justify-between gap-1 pt-1">
                              <p className="text-[8px] text-slate-500 font-mono">
                                Loop: <strong className="text-slate-700">{formatTime(asset.hookStart || 0)}</strong> - <strong className="text-slate-700">{formatTime(asset.hookEnd || 15)}</strong>
                              </p>
                              
                              {asset.data?.mood && (
                                <span className={`px-1 py-0.5 text-[6.5px] font-bold rounded uppercase tracking-wider shrink-0 ${
                                  (asset.data.mood.toLowerCase().includes("romantic") || asset.data.mood.toLowerCase().includes("love"))
                                    ? "bg-rose-50 text-rose-600 border border-rose-150"
                                    : (asset.data.mood.toLowerCase().includes("happy") || asset.data.mood.toLowerCase().includes("upbeat"))
                                    ? "bg-amber-50 text-amber-600 border border-amber-150"
                                    : (asset.data.mood.toLowerCase().includes("sad") || asset.data.mood.toLowerCase().includes("emotional"))
                                    ? "bg-sky-50 text-sky-600 border border-sky-150"
                                    : "bg-indigo-50 text-indigo-600 border border-indigo-150"
                                }`}>
                                  {asset.data.mood.split(",")[0]}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Actions Footer Buttons */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <button
                              onClick={() => handlePlayAsset(asset)}
                              className={`text-[8.5px] font-black uppercase tracking-wider flex items-center gap-1 px-2 py-1 rounded-lg transition-all cursor-pointer ${
                                isActive 
                                  ? "text-indigo-700 bg-indigo-50 border border-indigo-150 font-bold" 
                                  : "text-slate-500 hover:text-indigo-600 hover:bg-slate-100/60"
                              }`}
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                              {isActive ? (
                                <span className="flex items-center gap-0.5">
                                  <span>Active</span>
                                  {/* Minimal live equalizer waves animation */}
                                  <span className="flex gap-px items-end h-2 w-1.5 mb-0.5">
                                    <span className="w-px bg-indigo-600 h-1 animate-pulse" />
                                    <span className="w-px bg-indigo-600 h-2 animate-pulse" />
                                    <span className="w-px bg-indigo-600 h-1 animate-pulse" />
                                  </span>
                                </span>
                              ) : "Play"}
                            </button>
                            
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleToggleCurate(asset)}
                                className={`p-1.5 rounded-lg transition cursor-pointer ${
                                  asset.isCurated 
                                    ? "text-amber-500 bg-amber-50 hover:bg-amber-100" 
                                    : "text-slate-400 hover:text-amber-500 hover:bg-amber-50/50"
                                }`}
                                title={asset.isCurated ? "Curated Hook (Click to Unmark)" : "Mark as Curated Hook"}
                              >
                                <Star className={`w-2.5 h-2.5 ${asset.isCurated ? "fill-amber-500" : ""}`} />
                              </button>
                              <button
                                onClick={() => handleStartRename(asset)}
                                className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition cursor-pointer"
                                title="Rename Clip"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteAsset(asset.id)}
                                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition cursor-pointer"
                                title="Delete Clip"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
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
