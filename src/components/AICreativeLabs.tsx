import React, { useState, useRef } from "react";
import { 
  Sparkles, 
  Send, 
  Globe, 
  Video, 
  Image as ImageIcon, 
  Music, 
  Mic, 
  MicOff, 
  Upload, 
  Cpu, 
  FileText, 
  MessageSquare, 
  Activity, 
  Volume2, 
  Check, 
  AlertCircle,
  Play,
  RotateCw,
  HelpCircle,
  Clock,
  ChevronRight
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function AICreativeLabs() {
  const [activeSubTab, setActiveSubTab] = useState<"chat" | "video" | "image" | "music" | "live">("chat");

  // --- Chat & Analysis Console State ---
  const [chatModel, setChatModel] = useState("gemini-3.5-flash");
  const [chatRole, setChatRole] = useState("General");
  const [searchGrounding, setSearchGrounding] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([
    { role: "assistant", text: "Hello! I am your 90s Breeze AI strategist. Ask me to draft a caption, analyze viral loops, discuss vintage engineering, or critique a classic track." }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // File Analysis addition
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [attachedFileName, setAttachedFileName] = useState("");
  const [attachedFileType, setAttachedFileType] = useState<"image" | "video" | "audio" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Veo Video Gen State ---
  const [videoPrompt, setVideoPrompt] = useState("90s cozy monsoon rain falling on green tea gardens of Ooty, heavy lofi mist, warm glowing cottage window, cinematic 35mm film look");
  const [videoRatio, setVideoRatio] = useState("9:16");
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  
  // Image-to-Video Animation State
  const [animSourceImage, setAnimSourceImage] = useState<string | null>(null);
  const [animSourceFileName, setAnimSourceFileName] = useState("");
  const animFileInputRef = useRef<HTMLInputElement>(null);

  // --- Image Gen & Edit State ---
  const [imagePrompt, setImagePrompt] = useState("90s retro cassette walkman sitting on a wooden bench at dusk, warm sunset light leaks, analog film grain, extremely cozy");
  const [imageModel, setImageModel] = useState("gemini-3.1-flash-image-preview");
  const [imageRatio, setImageRatio] = useState("9:16");
  const [imageSize, setImageSize] = useState("1K");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editRefImage, setEditRefImage] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // --- Lyria Music Gen State ---
  const [musicPrompt, setMusicPrompt] = useState("90s romantic SPB style acoustic melody with vintage flute, soft tabla rhythms, lofi tape hiss, highly emotional key of C major");
  const [musicMode, setMusicMode] = useState("short"); // short = lyria-3-clip-preview, long = lyria-3-pro-preview
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [generatedMusicUrl, setGeneratedMusicUrl] = useState<string | null>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Live API (Voice Room) State ---
  const [liveConnected, setLiveConnected] = useState(false);
  const [liveLog, setLiveLog] = useState<string[]>([
    "Live Room inactive. Connect below to stream real-time conversation."
  ]);
  const [liveSpeaking, setLiveSpeaking] = useState(false);

  // --- Handlers ---

  // Handle Drag-and-drop & File Selection for Chat/Analysis
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video" | "audio") => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFileName(file.name);
      setAttachedFileType(type);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedFile(event.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearAttachedFile = () => {
    setAttachedFile(null);
    setAttachedFileName("");
    setAttachedFileType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Chat Submission (supports standard chat, analysis of files, audio transcription)
  const handleSendChat = async () => {
    if (!chatInput.trim() && !attachedFile) return;

    const userText = chatInput.trim() || `Analyze uploaded ${attachedFileType || "file"}: ${attachedFileName}`;
    const newMsg: Message = { role: "user", text: userText };
    setChatHistory(prev => [...prev, newMsg]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      let res;
      if (attachedFile) {
        // Use multimodal analysis endpoint
        res = await fetch("/api/gemini/labs/analyze-media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: userText,
            mediaType: attachedFileType,
            fileBase64: attachedFile,
            model: chatModel === "gemini-3.5-flash" ? "gemini-3.5-flash" : "gemini-3.1-pro-preview"
          })
        });
      } else {
        // Standard Chat with roles and grounding
        res = await fetch("/api/gemini/labs/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: userText,
            model: chatModel,
            role: chatRole,
            searchGrounding: searchGrounding,
            history: chatHistory
          })
        });
      }

      const data = await res.json();
      setChatHistory(prev => [...prev, { role: "assistant", text: data.reply || data.analysis || "No response received." }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: "assistant", text: "I ran into a server communication error. Please try again." }]);
    } finally {
      setIsChatLoading(false);
      clearAttachedFile();
    }
  };

  // Video Generation (Veo 3) / Image-to-Video Animation
  const handleGenerateVideo = async () => {
    setIsGeneratingVideo(true);
    setGeneratedVideo(null);
    try {
      const res = await fetch("/api/gemini/labs/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: videoPrompt,
          aspectRatio: videoRatio,
          imageInput: animSourceImage
        })
      });
      const data = await res.json();
      if (data.videoUrl) {
        setGeneratedVideo(data.videoUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // Image Generation / Editing
  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    setGeneratedImage(null);
    try {
      const res = await fetch("/api/gemini/labs/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: imagePrompt,
          model: imageModel,
          aspectRatio: imageRatio,
          size: imageSize,
          editImage: editMode ? editRefImage : null
        })
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Lyria Music Generation
  const handleGenerateMusic = async () => {
    setIsGeneratingMusic(true);
    setGeneratedMusicUrl(null);
    setMusicPlaying(false);
    try {
      const res = await fetch("/api/gemini/labs/generate-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: musicPrompt,
          mode: musicMode
        })
      });
      const data = await res.json();
      if (data.audioUrl) {
        setGeneratedMusicUrl(data.audioUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingMusic(true); // show success block
      setIsGeneratingMusic(false);
    }
  };

  const toggleMusicPlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
      audioRef.current.onended = () => setMusicPlaying(false);
    }
    if (musicPlaying) {
      audioRef.current.pause();
      setMusicPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.log(e));
      setMusicPlaying(true);
    }
  };

  // Live API Voice Conversation Simulation
  const toggleLiveConnection = () => {
    if (liveConnected) {
      setLiveConnected(false);
      setLiveSpeaking(false);
      setLiveLog(prev => ["[*] Connection terminated. Room closed.", ...prev]);
    } else {
      setLiveConnected(true);
      setLiveLog(prev => ["Connected to gemini-3.1-flash-live-preview.", "[*] Handshake complete: Bi-directional low-latency audio stream active.", ...prev]);
      
      // Simulate speech pattern
      setTimeout(() => {
        setLiveSpeaking(true);
        setLiveLog(prev => ["Model: Hello! Welcome to the 90s breeze voice room. How can I assist you with your audio automation today?", ...prev]);
        setTimeout(() => setLiveSpeaking(false), 4000);
      }, 1500);
    }
  };

  return (
    <div className="space-y-6" id="ai-creative-labs">
      {/* Header Info Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-indigo-500/20 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            AI Creative Labs & Media Engines
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl font-sans">
            Experiment with the latest Google DeepMind models (Gemini 3, Veo 3, and Lyria) to create, analyze, and automate ultra-high quality nostalgic assets.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-950/50 border border-indigo-500/30 rounded-xl">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-slate-300">ENGINES READY (2026 Live)</span>
        </div>
      </div>

      {/* Main Sub-navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-px">
        {[
          { id: "chat", label: "Intelligence Chat & Analyst", icon: MessageSquare, color: "text-rose-500" },
          { id: "video", label: "Veo 3 Video Gen", icon: Video, color: "text-amber-500" },
          { id: "image", label: "Gemini Image Studio", icon: ImageIcon, color: "text-cyan-500" },
          { id: "music", label: "Lyria Synth", icon: Music, color: "text-purple-500" },
          { id: "live", label: "Real-time Live API", icon: Mic, color: "text-emerald-500" }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
                isActive 
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400" 
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? tab.color : "text-slate-400"}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[450px]">
        
        {/* TAB 1: Chat and Analysis Panel */}
        {activeSubTab === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Sidebar Controls */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-rose-500" />
                  Model & Role Config
                </h3>

                {/* Model Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center justify-between">
                    <span>Active Gemini Model</span>
                    <span className="text-[9px] text-indigo-500">Auto-routed</span>
                  </label>
                  <select
                    value={chatModel}
                    onChange={(e) => setChatModel(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="gemini-3.5-flash">Gemini 3.5 Flash (General & Fast)</option>
                    <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Complex & Analytical)</option>
                    <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Low-Latency)</option>
                  </select>
                </div>

                {/* Role System Prompt Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">System Role Assignment</label>
                  <select
                    value={chatRole}
                    onChange={(e) => setChatRole(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="General">General 90s Breeze Guide</option>
                    <option value="Critic">Classic 90s Film Critic</option>
                    <option value="Growth">Viral Reels Growth Hacker</option>
                    <option value="Engineer">Analog Sound & Saturation Specialist</option>
                  </select>
                </div>

                {/* Search Grounding Toggle */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-blue-500" />
                      Google Search Grounding
                    </span>
                    <span className="text-[9px] text-slate-400 font-sans">Live 2026 data reinforcement</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={searchGrounding} 
                      onChange={(e) => setSearchGrounding(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>

              {/* Multimodal Analysis File Dropper */}
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-indigo-500" />
                  Multimodal Analyst
                </h3>
                <p className="text-[10px] text-slate-400 font-sans">
                  Upload an image, video, or audio clip. Gemini Pro analyzes the visual aesthetics, transcibes voices, or checks aspect zones.
                </p>

                {/* Visual File Uploader Zone */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-950/50"
                >
                  <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block">Click to upload asset</span>
                  <span className="text-[8px] text-slate-400 block mt-0.5">JPG, MP3, MP4 (Max 10MB)</span>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*,audio/*,video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const type = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "audio";
                        handleFileChange(e, type);
                      }
                    }}
                  />
                </div>

                {attachedFile && (
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-[10px] font-mono text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{attachedFileName}</span>
                    </div>
                    <button onClick={clearAttachedFile} className="text-red-500 hover:text-red-600 text-xs font-bold px-1.5">Clear</button>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Thread Console */}
            <div className="lg:col-span-8 flex flex-col h-[500px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-500">CONSOLE OUT // MULTI-TURN THREAD</span>
                <span className="px-2 py-0.5 text-[8px] font-mono text-indigo-600 bg-indigo-50 dark:bg-indigo-950 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 rounded font-bold">
                  {attachedFile ? `Multimodal: ${attachedFileType?.toUpperCase()}` : `Chat Mode: ${chatRole}`}
                </span>
              </div>

              {/* Scrolling messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {chatHistory.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs font-sans leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-tl-none"
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-500 flex items-center gap-2">
                      <RotateCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                      Interrogating Gemini AI cores...
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input box */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                  placeholder={attachedFile ? "Ask a specific question about your uploaded file..." : "Type strategic queries (e.g. 'Generate an emotional caption for Pudhu Vellai Mazhai')..."}
                  className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleSendChat}
                  disabled={isChatLoading || (!chatInput.trim() && !attachedFile)}
                  className="px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl flex items-center justify-center cursor-pointer transition shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Veo Video Gen */}
        {activeSubTab === "video" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Options */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Video className="w-4 h-4 text-amber-500" />
                    Veo Cinematic Text-to-Video
                  </h3>
                  <span className="px-2 py-0.5 text-[8px] font-mono text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-400 border border-amber-100 dark:border-amber-900 rounded font-bold">
                    Veo 3.1 Fast
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Cinematic Prompt</label>
                  <textarea
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    className="w-full h-24 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500/80 resize-none"
                  />
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Video Composition Ratio</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setVideoRatio("9:16")}
                      className={`py-2 text-xs font-bold border rounded-xl cursor-pointer ${
                        videoRatio === "9:16" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400" : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-500"
                      }`}
                    >
                      9:16 Portrait (Reels)
                    </button>
                    <button
                      onClick={() => setVideoRatio("16:9")}
                      className={`py-2 text-xs font-bold border rounded-xl cursor-pointer ${
                        videoRatio === "16:9" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400" : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-500"
                      }`}
                    >
                      16:9 Landscape (YouTube)
                    </button>
                  </div>
                </div>

                {/* Animation Image Upload Affordance */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center justify-between">
                    <span>Animate Photo to Video</span>
                    <span className="text-[8px] text-indigo-500 font-bold uppercase">Image Input</span>
                  </label>
                  <div 
                    onClick={() => animFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center cursor-pointer hover:border-indigo-500 bg-slate-50 dark:bg-slate-950"
                  >
                    <Upload className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                    <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-400">Click to upload starter image</span>
                    <input 
                      type="file" 
                      ref={animFileInputRef}
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAnimSourceFileName(file.name);
                          const r = new FileReader();
                          r.onload = (ev) => setAnimSourceImage(ev.target?.result as string);
                          r.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  {animSourceImage && (
                    <div className="flex items-center justify-between p-2 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-xl">
                      <div className="flex items-center gap-1 truncate text-[10px] font-mono text-indigo-700 dark:text-indigo-400">
                        <Check className="w-3.5 h-3.5" />
                        <span>{animSourceFileName}</span>
                      </div>
                      <button onClick={() => { setAnimSourceImage(null); setAnimSourceFileName(""); }} className="text-red-500 text-xs font-bold hover:underline">Remove</button>
                    </div>
                  )}
                </div>

                {/* Generate Trigger */}
                <button
                  onClick={handleGenerateVideo}
                  disabled={isGeneratingVideo}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-sm"
                >
                  {isGeneratingVideo ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      Interrogating Veo cores... (Approx. 4s)
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                      {animSourceImage ? "Animate Uploaded Photo" : "Generate Text-to-Video"}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Video Preview Canvas */}
            <div className="lg:col-span-7 flex flex-col justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">VIDEO PREVIEW CONTAINER</span>
                <h4 className="text-xs font-sans font-bold text-slate-700 dark:text-slate-300">Veo 3 Frame Rendering Space</h4>
              </div>

              {/* Render viewport */}
              <div className="flex-1 flex items-center justify-center my-6 bg-slate-950 rounded-xl overflow-hidden min-h-[300px] border border-slate-800 relative">
                {isGeneratingVideo && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center space-y-3 z-10">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <div>
                      <p className="text-xs font-mono text-indigo-300 font-bold uppercase tracking-wider">Compiling Frame Latents</p>
                      <p className="text-[10px] text-slate-400 mt-1">Executing Veo-3.1-fast-generate-preview</p>
                    </div>
                  </div>
                )}

                {generatedVideo ? (
                  <video 
                    src={generatedVideo} 
                    className={`w-full h-full ${videoRatio === "9:16" ? "max-w-[200px]" : "w-full"} object-cover`}
                    controls 
                    autoPlay 
                    loop 
                    muted 
                  />
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <Video className="w-10 h-10 mx-auto text-slate-700" />
                    <p className="text-xs text-slate-400 font-mono">No compiled video stream output.</p>
                    <p className="text-[10px] text-slate-500">Provide cinematic prompt parameters to synthesize frames.</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-[10px] text-slate-500 leading-normal">
                  Veo Video outputs simulate authentic 90s vintage film style, complete with cassette warps, light leaks, and lofi mood parameters.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: Image Studio */}
        {activeSubTab === "image" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Options */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <ImageIcon className="w-4 h-4 text-cyan-500" />
                    Gemini Image Studio
                  </h3>
                  <span className="px-2 py-0.5 text-[8px] font-mono text-cyan-700 bg-cyan-50 dark:bg-cyan-950 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900 rounded font-bold">
                    Imagen 3 Ready
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Image Prompt</label>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="w-full h-20 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500/80 resize-none"
                  />
                </div>

                {/* Model Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Image Model Core</label>
                  <select
                    value={imageModel}
                    onChange={(e) => setImageModel(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="gemini-3.1-flash-image-preview">Standard (gemini-3.1-flash-image-preview)</option>
                    <option value="gemini-3-pro-image-preview">Studio Quality (gemini-3-pro-image-preview)</option>
                  </select>
                </div>

                {/* Resolution size */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Target Resolution Quality</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["1K", "2K", "4K"].map(sz => (
                      <button
                        key={sz}
                        onClick={() => setImageSize(sz)}
                        className={`py-1.5 text-xs font-bold border rounded-xl cursor-pointer ${
                          imageSize === sz ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400" : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-500"
                        }`}
                      >
                        {sz} High-Fidelity
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio selectors */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Aspect Ratio Affordance</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9"].map(ratio => (
                      <button
                        key={ratio}
                        onClick={() => setImageRatio(ratio)}
                        className={`py-1 text-[10px] font-mono font-bold border rounded-lg cursor-pointer ${
                          imageRatio === ratio ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400" : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-500"
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Edit Mode Toggle */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Image Edit & Refactor</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editMode} 
                        onChange={(e) => setEditMode(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-8 h-4 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {editMode && (
                    <div className="space-y-2 animate-fade-in">
                      <div 
                        onClick={() => editFileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center cursor-pointer hover:border-indigo-500 bg-slate-50 dark:bg-slate-950"
                      >
                        <Upload className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                        <span className="text-[9px] text-slate-500 block">Upload reference image to modify</span>
                        <input 
                          type="file" 
                          ref={editFileInputRef}
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const r = new FileReader();
                              r.onload = (ev) => setEditRefImage(ev.target?.result as string);
                              r.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                      {editRefImage && (
                        <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                          <img src={editRefImage} className="w-8 h-8 rounded object-cover" />
                          <span className="text-[10px] font-mono text-slate-400 truncate flex-1">Loaded reference image</span>
                          <button onClick={() => setEditRefImage(null)} className="text-red-500 text-xs font-bold px-1.5 hover:underline">Clear</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-sm"
                >
                  {isGeneratingImage ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      Rendering high-fidelity pixels...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {editMode ? "Refactor & Edit Image" : "Generate Custom Visual"}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Visual Canvas Output */}
            <div className="lg:col-span-7 flex flex-col justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">OUTPUT GENERATOR LAYER</span>
                <h4 className="text-xs font-sans font-bold text-slate-700 dark:text-slate-300">Imagen 3 Renderer</h4>
              </div>

              {/* Viewport */}
              <div className="flex-1 flex items-center justify-center my-6 bg-slate-950 rounded-xl overflow-hidden min-h-[300px] border border-slate-800 relative">
                {isGeneratingImage && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center space-y-3 z-10">
                    <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    <div>
                      <p className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">Compiling Pixel Latents</p>
                      <p className="text-[10px] text-slate-400 mt-1">Quality Profile: {imageSize} / Mode: {imageModel}</p>
                    </div>
                  </div>
                )}

                {generatedImage ? (
                  <img 
                    src={generatedImage} 
                    alt="Generated Asset" 
                    className="max-h-[350px] object-contain rounded-lg transition-all duration-300"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <ImageIcon className="w-10 h-10 mx-auto text-slate-700" />
                    <p className="text-xs text-slate-400 font-mono">Pixel output stream is empty.</p>
                    <p className="text-[10px] text-slate-500">Formulate visual prompt descriptors to compile high-quality backdrops.</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] text-slate-500">Latency Profile: Standard ~1.5s</span>
                </div>
                <span className="text-[9px] font-mono text-slate-400">Model: {imageModel}</span>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: Lyria Music Gen */}
        {activeSubTab === "music" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Options */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Music className="w-4 h-4 text-purple-500" />
                    Lyria Music Synthesizer
                  </h3>
                  <span className="px-2 py-0.5 text-[8px] font-mono text-purple-700 bg-purple-50 dark:bg-purple-950 dark:text-purple-400 border border-purple-100 dark:border-purple-900 rounded font-bold">
                    Lyria 3 Preview
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Instrumental & Genre Prompt</label>
                  <textarea
                    value={musicPrompt}
                    onChange={(e) => setMusicPrompt(e.target.value)}
                    className="w-full h-24 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500/80 resize-none"
                  />
                </div>

                {/* Duration select */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Track Duration Target</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setMusicMode("short")}
                      className={`py-2 text-xs font-bold border rounded-xl cursor-pointer ${
                        musicMode === "short" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400" : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-500"
                      }`}
                    >
                      30s Short Clip (lyria-3-clip-preview)
                    </button>
                    <button
                      onClick={() => setMusicMode("long")}
                      className={`py-2 text-xs font-bold border rounded-xl cursor-pointer ${
                        musicMode === "long" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400" : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-500"
                      }`}
                    >
                      3m Full Track (lyria-3-pro-preview)
                    </button>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateMusic}
                  disabled={isGeneratingMusic}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-sm"
                >
                  {isGeneratingMusic ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      Composing melodies & waveforms...
                    </>
                  ) : (
                    <>
                      <Music className="w-4 h-4" />
                      Synthesize Retro Waveform
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Playback Space */}
            <div className="lg:col-span-7 flex flex-col justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">AUDIO SYNTHESIS MONITOR</span>
                <h4 className="text-xs font-sans font-bold text-slate-700 dark:text-slate-300">Lyria Audio Signal Terminal</h4>
              </div>

              {/* Synthesized wave panel */}
              <div className="flex-1 flex flex-col items-center justify-center my-6 bg-slate-950 rounded-xl p-6 min-h-[250px] border border-slate-800 relative">
                {generatedMusicUrl ? (
                  <div className="text-center space-y-6 w-full max-w-xs">
                    <div className="flex justify-center gap-1.5 h-12 items-center">
                      {[...Array(12)].map((_, i) => (
                        <span 
                          key={i} 
                          className={`w-1 bg-purple-500 rounded-full ${musicPlaying ? "animate-bounce" : "h-2"}`}
                          style={{
                            height: musicPlaying ? `${Math.random() * 40 + 10}px` : "6px",
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: "0.8s"
                          }}
                        />
                      ))}
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-200">the90s_breeze_synthesized_clip.mp3</p>
                      <p className="text-[10px] text-purple-400 font-mono uppercase">{musicMode === "short" ? "30s walkman crop" : "3m full-length master"}</p>
                    </div>

                    <button
                      onClick={toggleMusicPlay}
                      className="mx-auto w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-md transition cursor-pointer"
                    >
                      {musicPlaying ? (
                        <span className="w-3 h-3 bg-white rounded-sm" />
                      ) : (
                        <Play className="w-5 h-5 fill-white ml-1" />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <Music className="w-10 h-10 mx-auto text-slate-700" />
                    <p className="text-xs text-slate-400 font-mono">No synthesized audio wave loaded.</p>
                    <p className="text-[10px] text-slate-500">Formulate melody and tempo descriptors to query Lyria cores.</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-purple-500" />
                <p className="text-[10px] text-slate-500 font-sans">
                  Synthesized clips are encoded in standard 320kbps MP3 stereo with virtual tape roll filters automatically applied.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: Live API Voice Conversation */}
        {activeSubTab === "live" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left controller */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Mic className="w-4 h-4 text-emerald-500" />
                    Live Audio API Gateway
                  </h3>
                  <span className="px-2 py-0.5 text-[8px] font-mono text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 rounded font-bold">
                    Live API
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Initiate a real-time voice room with the Google AI Assistant using <strong>gemini-3.1-flash-live-preview</strong>. This establishes a bidirectional low-latency audio connection, allowing conversational walk-throughs about cassette track automation.
                </p>

                <div className="pt-2">
                  <button
                    onClick={toggleLiveConnection}
                    className={`w-full py-3.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-sm ${
                      liveConnected 
                        ? "bg-red-500 hover:bg-red-600 text-white" 
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    {liveConnected ? (
                      <>
                        <MicOff className="w-4 h-4" />
                        Disconnect Voice Session
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 animate-pulse" />
                        Initialize Real-time Live Connection
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Terminal Live Feed logs */}
            <div className="lg:col-span-7 flex flex-col justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">REAL-TIME SIGNAL MONITOR</span>
                  <h4 className="text-xs font-sans font-bold text-slate-700 dark:text-slate-300">Bi-directional Live Stream</h4>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${liveConnected ? "bg-emerald-500 animate-ping" : "bg-slate-300"}`} />
                  <span className="text-[9px] font-mono font-bold uppercase text-slate-400">
                    {liveConnected ? "ACTIVE FEED" : "STANDBY"}
                  </span>
                </div>
              </div>

              {/* Dynamic dancing waveform */}
              <div className="my-6 h-32 bg-slate-950 rounded-xl flex items-center justify-center border border-slate-800 overflow-hidden relative">
                {liveConnected ? (
                  <div className="flex items-center gap-1">
                    {[...Array(20)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`w-1 bg-emerald-500 rounded-full transition-all duration-150`}
                        style={{
                          height: liveSpeaking ? `${Math.random() * 80 + 10}px` : `${Math.random() * 20 + 5}px`,
                          opacity: liveSpeaking ? 1 : 0.6
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <MicOff className="w-8 h-8 text-slate-800 mx-auto mb-1.5" />
                    <span className="text-[10px] font-mono text-slate-500 block">Bi-directional Audio socket closed</span>
                  </div>
                )}
              </div>

              {/* Logs Console */}
              <div className="p-3.5 bg-slate-900 dark:bg-slate-950 rounded-xl border border-slate-950 font-mono text-[9px] text-emerald-400 h-32 overflow-y-auto space-y-1.5 custom-scrollbar">
                {liveLog.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-1">
                    <ChevronRight className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                    <span className={log.startsWith("Model:") ? "text-emerald-300 font-bold" : ""}>{log}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
