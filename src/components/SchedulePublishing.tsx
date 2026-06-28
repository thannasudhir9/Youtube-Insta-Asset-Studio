import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Trash2, 
  Share2, 
  CheckCircle, 
  Clock, 
  Terminal, 
  ExternalLink,
  Loader2,
  Tv,
  ArrowUpRight,
  Play,
  RotateCw,
  ChevronRight
} from "lucide-react";
import { QueueItem } from "../types";

interface SchedulePublishingProps {
  queue: QueueItem[];
  onRemoveItem: (id: string) => void;
  onPublishSuccess: (id: string) => void;
}

export default function SchedulePublishing({ queue, onRemoveItem, onPublishSuccess }: SchedulePublishingProps) {
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishLogs, setPublishLogs] = useState<string[]>([]);
  const [showLogTerminal, setShowLogTerminal] = useState<boolean>(false);

  // Simulate Meta Graph API Publishing Sequence
  const triggerSimulatedPublish = (item: QueueItem) => {
    setPublishingId(item.id);
    setPublishLogs([]);
    setShowLogTerminal(true);

    const steps = [
      `[*] Initiating publication sequence for track "${item.song}"...`,
      "[*] Fetching scheduled vertical video binary URL from secure Cloud storage...",
      `[*] Meta API: POST https://graph.facebook.com/v19.0/1784140534291/media`,
      "[*] Header: Authorization: Bearer FACEBOOK_ACCESS_TOKEN",
      `[*] Payload: { "media_type": "REELS", "video_url": "https://storage.googleapis.com/breeze-90s-vault/${encodeURIComponent(item.song)}.mp4", "caption": "..." }`,
      "[+] Meta API: Created Media Container successfully. ID: 180128456201385",
      "[*] Polling Instagram Transcode Engine for video status...",
      "[*] GET https://graph.facebook.com/v19.0/180128456201385?fields=status_code",
      "    - Status: IN_PROGRESS (Waiting for transcode...)",
      "[*] GET https://graph.facebook.com/v19.0/180128456201385?fields=status_code",
      "    - Status: FINISHED (Transcode complete, video verified!)",
      `[*] Meta API: POST https://graph.facebook.com/v19.0/1784140534291/media_publish`,
      "[*] Payload: { \"creation_id\": \"180128456201385\" }",
      "[++++] SUCCESS: Reel successfully published to Instagram Live feed!",
      `[+] Instagram Post ID: https://www.instagram.com/p/C_90sBreezeReelSimulated`
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setPublishLogs(prev => [...prev, step]);
        if (idx === steps.length - 1) {
          setPublishingId(null);
          onPublishSuccess(item.id);
        }
      }, (idx + 1) * 350);
    });
  };

  // Organize queue by date
  const sortedQueue = [...queue].sort((a, b) => a.publishDate.localeCompare(b.publishDate));

  return (
    <div className="space-y-6" id="schedule-publishing">
      {/* Visual Posting Blueprint calendar card */}
      <div className="p-6 bg-gradient-to-br from-indigo-50 to-slate-50 border border-slate-200/80 shadow-sm rounded-2xl">
        <h3 className="text-sm font-mono font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <CalendarIcon className="w-4 h-4 text-indigo-600" />
          Nostalgia Content Grid (Weekly Strategy)
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          To maintain algorithm placement, @the90s_breeze post frequency is optimized for daily slots. Here's your recommended strategy calendar:
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { day: "Monday", lang: "Telugu", vibe: "Heavy Melodies", bg: "border-orange-200 bg-orange-50/50 text-orange-800" },
            { day: "Tuesday", lang: "Tamil", vibe: "SPB Classics", bg: "border-blue-200 bg-blue-50/50 text-blue-800" },
            { day: "Wednesday", lang: "Hindi", vibe: "90s Ballads", bg: "border-pink-200 bg-pink-50/50 text-pink-800" },
            { day: "Thursday", lang: "Malayalam", vibe: "Evergreens", bg: "border-emerald-200 bg-emerald-50/50 text-emerald-800" },
            { day: "Friday", lang: "Mashup", vibe: "Multilingual Mix", bg: "border-indigo-200 bg-indigo-50/50 text-indigo-800" }
          ].map((slot, idx) => (
            <div key={idx} className={`p-3.5 border rounded-xl text-center space-y-1 ${slot.bg}`}>
              <div className="text-[10px] font-mono font-bold uppercase">{slot.day}</div>
              <div className="text-xs font-bold">{slot.lang}</div>
              <div className="text-[9px] opacity-80">{slot.vibe}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main publishing lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Content Queue List Left Column (Grid Span 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              Content Queue ({sortedQueue.length} Videos)
            </h4>
          </div>

          {sortedQueue.length === 0 ? (
            <div className="p-12 bg-white border border-slate-200 shadow-sm rounded-2xl text-center text-slate-500 text-xs">
              Your content calendar is empty. Generate a video inside the Asset Studio to schedule it!
            </div>
          ) : (
            <div className="space-y-3">
              {sortedQueue.map((item) => (
                <div 
                  key={item.id}
                  className={`p-5 bg-white border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition duration-250 ${
                    item.status === "published" 
                      ? "border-emerald-200 bg-emerald-50/40" 
                      : "border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Media thumbnail mini mockup */}
                    <div className="w-12 h-16 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden shrink-0 relative">
                      {item.bgUrl ? (
                        <img src={item.bgUrl} alt="Thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full bg-slate-200" />
                      )}
                      <span className="absolute bottom-1 right-1 px-1 py-0.5 text-[8px] font-mono text-white bg-black/60 rounded">
                        9:16
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 text-[9px] font-mono rounded font-semibold ${
                          item.language === "telugu" ? "bg-orange-50 text-orange-800 border border-orange-200" :
                          item.language === "tamil" ? "bg-blue-50 text-blue-800 border border-blue-200" :
                          item.language === "hindi" ? "bg-pink-50 text-pink-800 border border-pink-200" :
                          "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}>
                          {item.language.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          Scheduled: {item.publishDate}
                        </span>
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 leading-tight">
                        {item.song}
                      </h5>
                      <p className="text-xs text-slate-500">
                        Movie: <span className="text-slate-700 font-semibold">{item.movie}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 md:pt-0 border-t border-slate-100 md:border-t-0 justify-end">
                    {item.status === "published" ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-mono font-bold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        PUBLISHED
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => triggerSimulatedPublish(item)}
                          disabled={publishingId !== null}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400/30 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          Publish Now
                        </button>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          disabled={publishingId !== null}
                          className="p-2 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-500 hover:text-rose-600 rounded-xl transition cursor-pointer"
                          title="Remove Post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Console Request/Response API Logs Right Column (Grid Span 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-slate-400" />
              Meta API Integration terminal
            </h4>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3.5 min-h-[300px] flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 pb-2.5 border-b border-slate-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Meta Graph Connection: ONLINE
              </div>

              {showLogTerminal ? (
                <div className="font-mono text-[10px] text-emerald-600 space-y-2 mt-3 h-64 overflow-y-auto custom-scrollbar">
                  {publishLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-1">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="break-all">{log}</span>
                    </div>
                  ))}
                  {publishingId && (
                    <div className="flex items-center gap-2 text-indigo-600 font-semibold mt-2 animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Posting payloads...
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-slate-500 text-xs py-16 space-y-2 font-mono">
                  <Terminal className="w-8 h-8 text-slate-300 mx-auto animate-pulse" />
                  <p>Awaiting publish events...</p>
                  <p className="text-[10px] text-slate-400 leading-normal">Simulate a Reels upload to observe JSON payloads and status codes in real time.</p>
                </div>
              )}
            </div>

            {showLogTerminal && (
              <button
                onClick={() => setShowLogTerminal(false)}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] text-slate-500 font-mono transition cursor-pointer"
              >
                Clear Terminal Console
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
