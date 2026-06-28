import React, { useState, useEffect } from "react";
import { 
  Tv, 
  Workflow, 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  FileCode, 
  Heart, 
  Disc, 
  Sliders,
  Database,
  Sun,
  Moon,
  Brain,
  Settings
} from "lucide-react";
import ArchitectureView from "./components/ArchitectureView";
import TrendDiscovery from "./components/TrendDiscovery";
import AssetStudio from "./components/AssetStudio";
import SchedulePublishing from "./components/SchedulePublishing";
import AnalyticsView from "./components/AnalyticsView";
import ScriptsExporter from "./components/ScriptsExporter";
import AICreativeLabs from "./components/AICreativeLabs";
import YoutubeFetcher from "./components/YoutubeFetcher";
import ConfigView from "./components/ConfigView";
import { TrendItem, QueueItem } from "./types";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, signInWithGoogle, logout, db } from "./lib/firebase";
import { collection, query, where, getDocs, setDoc, deleteDoc, doc } from "firebase/firestore";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("architecture");
  const [selectedSong, setSelectedSong] = useState<TrendItem | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("telugu");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [utcTime, setUtcTime] = useState("");
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });
  const [user, setUser] = useState<User | null>(null);
  const [storageType, setStorageType] = useState<"local" | "drive">(() => {
    const saved = localStorage.getItem("the90s_Breeze_storageType");
    return (saved === "drive" ? "drive" : "local") as "local" | "drive";
  });

  useEffect(() => {
    localStorage.setItem("the90s_Breeze_storageType", storageType);
  }, [storageType]);

  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Update current UTC clock on header
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace("GMT", "UTC"));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Monitor auth status and load synchronized queue items from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const q = query(collection(db, "queue"), where("userId", "==", currentUser.uid));
          const snapshot = await getDocs(q);
          const loadedQueue: QueueItem[] = [];
          snapshot.forEach((docSnap) => {
            loadedQueue.push({ id: docSnap.id, ...docSnap.data() } as QueueItem);
          });
          if (loadedQueue.length > 0) {
            setQueue(loadedQueue);
          }
        } catch (error) {
          console.error("Error fetching user queue from Firestore: ", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Sign in failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setQueue([]); // Clear queue on logout to protect user boundary
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // When a song is selected in Trend Scout, load it into the Studio and direct the user there
  const handleSelectSong = (song: TrendItem, language: string) => {
    setSelectedSong(song);
    setSelectedLanguage(language);
    setActiveTab("studio");
  };

  // Add compiled assets to content schedule queue & persist to Firestore if signed in
  const handleAddToQueue = async (item: Omit<QueueItem, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newItem: QueueItem = {
      ...item,
      id
    };
    setQueue(prev => [...prev, newItem]);
    setActiveTab("schedule");

    if (user) {
      try {
        await setDoc(doc(db, "queue", id), {
          ...item,
          userId: user.uid,
          createdAt: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error saving queue item to Firestore: ", error);
      }
    }
  };

  // Remove scheduled asset & delete from Firestore if signed in
  const handleRemoveItem = async (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
    if (user) {
      try {
        await deleteDoc(doc(db, "queue", id));
      } catch (error) {
        console.error("Error deleting queue item from Firestore: ", error);
      }
    }
  };

  // Trigger publishing flag update on calendar & sync status to Firestore if signed in
  const handlePublishSuccess = async (id: string) => {
    setQueue(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, status: "published" as const };
        if (user) {
          setDoc(doc(db, "queue", id), { status: "published" as const }, { merge: true })
            .catch(e => console.error("Error updating published status on Firestore: ", e));
        }
        return updated;
      }
      return item;
    }));
  };

  // Sidebar / Header navigation definitions
  const navItems = [
    { id: "architecture", label: "Pipeline Architecture", icon: Workflow, color: "text-amber-400" },
    { id: "discovery", label: "Trend Scout", icon: Sparkles, color: "text-red-400" },
    { id: "youtube", label: "YouTube Fetcher", icon: Tv, color: "text-rose-400" },
    { id: "studio", label: "Asset Studio", icon: Sliders, color: "text-cyan-400" },
    { id: "labs", label: "AI Creative Labs", icon: Brain, color: "text-indigo-400" },
    { id: "schedule", label: "Content Schedule", icon: Calendar, color: "text-purple-400" },
    { id: "analytics", label: "Performance Analytics", icon: TrendingUp, color: "text-emerald-400" },
    { id: "scripts", label: "Automation Scripts", icon: FileCode, color: "text-blue-400" },
    { id: "config", label: "API Keys & Config", icon: Settings, color: "text-slate-400" }
  ];

  return (
    <div className={`flex h-screen w-full font-sans antialiased selection:bg-indigo-500/10 selection:text-indigo-950 overflow-hidden ${
      isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      
      {/* SIDEBAR - Dark Premium */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 select-none">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-white font-bold text-lg tracking-tight flex items-center">
            <span className="mr-2 text-indigo-400">✦</span> THE 90s BREEZE
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-semibold">
            Content Factory v2.1
          </p>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
            Operations Panel
          </div>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left text-xs font-semibold ${
                    isActive
                      ? "bg-slate-800 text-white border-l-2 border-indigo-400 shadow-sm"
                      : "bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? item.color : "text-slate-500"}`} />
                  <span className="flex-1 truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Firebase Authentication Sync Widget */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20 space-y-2">
          {user ? (
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-6.5 h-6.5 rounded-full object-cover" />
                ) : (
                  <div className="w-6.5 h-6.5 rounded-full bg-indigo-500 flex items-center justify-center text-[9px] font-bold text-white">
                    {user.displayName?.substring(0, 2).toUpperCase() || "US"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-white truncate leading-tight">{user.displayName || "Authorized User"}</p>
                  <p className="text-[8px] text-slate-500 truncate leading-none mt-0.5">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/60">
                <span className="text-[8px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  SYNCED TO CLOUD
                </span>
                <button
                  onClick={handleLogout}
                  className="text-[8px] font-mono font-black text-rose-400 hover:text-rose-300 transition uppercase tracking-wider cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer border border-indigo-500/30"
            >
              <Database className="w-3.5 h-3.5 text-indigo-300" />
              Sync with Google
            </button>
          )}
        </div>

        {/* Cloud Processor Progress Indicator */}
        <div className="p-5 border-t border-slate-800">
          <div className="bg-indigo-950/30 p-3 rounded-lg border border-indigo-500/20">
            <p className="text-[10px] text-indigo-300 font-bold tracking-wider uppercase mb-1">Cloud Processing</p>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="bg-indigo-400 h-full w-3/4 animate-pulse"></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              3 Jobs running...
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 flex flex-col overflow-hidden transition-colors duration-300 ${isDark ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
        
        {/* TOP HEADER */}
        <header className={`h-16 flex items-center justify-between px-6 sm:px-8 shrink-0 border-b transition-colors duration-300 ${isDark ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-200"}`}>
          <div className="flex items-center space-x-3">
            <h2 className="text-sm font-semibold text-slate-500">Automation Pipeline</h2>
            <span className="text-slate-300">/</span>
            <span className="text-sm text-slate-900 font-bold flex items-center gap-2">
              {navItems.find(n => n.id === activeTab)?.label}
              <span className="px-2 py-0.5 text-[9px] font-mono text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-full font-bold">
                Live
              </span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Live Clock */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{utcTime || "UTC Active"}</span>
            </div>

            {/* Accessibility Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-xl border flex items-center gap-2 transition duration-200 cursor-pointer shadow-sm ${
                isDark 
                  ? "bg-slate-800 border-slate-700 text-amber-400 hover:text-amber-300 hover:bg-slate-700" 
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
              <span className="hidden sm:inline text-[10px] font-mono uppercase font-bold tracking-wider">
                {isDark ? "Light Mode" : "Dark Mode"}
              </span>
            </button>

            {/* Google Sign-In Button on Top Right (Optional login) */}
            {user ? (
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User Avatar" className="w-5.5 h-5.5 rounded-full object-cover border border-indigo-400" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-5.5 h-5.5 rounded-full bg-indigo-500 flex items-center justify-center text-[8px] font-bold text-white">
                    {user.displayName?.substring(0, 2).toUpperCase() || "US"}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-[9px] font-bold leading-tight truncate max-w-[85px] text-slate-800 dark:text-slate-100">
                    {user.displayName || "User"}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[9px] font-mono font-black text-rose-500 hover:text-rose-600 px-1 py-0.5 uppercase transition cursor-pointer"
                >
                  Out
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition shadow-sm cursor-pointer border border-indigo-500/30 shrink-0"
              >
                <Database className="w-3.5 h-3.5 text-indigo-200" />
                Google Sign In
              </button>
            )}

            {/* Platform Badges */}
            <div className="hidden sm:flex -space-x-1.5">
              <div className="w-7 h-7 rounded-full border-2 border-white bg-red-500 flex items-center justify-center text-[9px] font-black text-white cursor-help shadow-sm" title="YouTube Active">YT</div>
              <div className="w-7 h-7 rounded-full border-2 border-white bg-pink-600 flex items-center justify-center text-[9px] font-black text-white cursor-help shadow-sm" title="Instagram Active">IG</div>
            </div>

            <button 
              onClick={() => {
                alert("Manual override engaged. Standard cron processes are temporarily paused while you are in manual override mode.");
              }} 
              className="bg-slate-900 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition shadow-sm cursor-pointer"
            >
              Manual Override
            </button>
          </div>
        </header>

        {/* DISPLAY STAGE */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* Main active view wrapper */}
          <div className="transition-all duration-300">
            {activeTab === "architecture" && <ArchitectureView />}
            {activeTab === "discovery" && <TrendDiscovery onSelectSong={handleSelectSong} />}
            {activeTab === "youtube" && (
              <YoutubeFetcher 
                user={user} 
                onAddToQueue={handleAddToQueue} 
                onGoogleSignIn={handleGoogleSignIn} 
                storageType={storageType}
                setStorageType={setStorageType}
              />
            )}
            {activeTab === "studio" && (
              <AssetStudio 
                selectedSong={selectedSong} 
                selectedLanguage={selectedLanguage}
                onAddToQueue={handleAddToQueue} 
                storageType={storageType}
                setStorageType={setStorageType}
              />
            )}
            {activeTab === "labs" && <AICreativeLabs />}
            {activeTab === "schedule" && (
              <SchedulePublishing 
                queue={queue} 
                onRemoveItem={handleRemoveItem} 
                onPublishSuccess={handlePublishSuccess} 
              />
            )}
            {activeTab === "analytics" && <AnalyticsView />}
            {activeTab === "scripts" && <ScriptsExporter />}
            {activeTab === "config" && (
              <ConfigView
                user={user}
                storageType={storageType}
                setStorageType={setStorageType}
                onGoogleSignIn={handleGoogleSignIn}
              />
            )}
          </div>

          {/* FOOTER */}
          <footer className="border-t border-slate-200/60 pt-6 mt-12 text-center text-[11px] text-slate-400 space-y-2 font-mono">
            <p>© 2026 the90s_breeze AI Music Automation Factory. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-4 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                Meta Graph APIs v19.0
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                YouTube Data APIs v3
              </span>
              <span className="flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                Powered by Gemini 3.5 & Image Gen
              </span>
            </div>
          </footer>

        </div>
      </main>

    </div>
  );
}
