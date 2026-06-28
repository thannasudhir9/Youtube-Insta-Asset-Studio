import React, { useState } from "react";
import { 
  Tv, 
  Workflow, 
  Sparkles, 
  ShieldAlert, 
  Video, 
  Share2, 
  Database,
  Terminal,
  Cpu,
  Layers,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export default function ArchitectureView() {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      id: 0,
      title: "1. Trend Discovery",
      icon: Sparkles,
      desc: "Fetches trending nostalgic tracks from YouTube & regional playlist trends. Gemini LLM processes playlist metrics to isolate 30-second viral peak hooks.",
      tech: ["YouTube Data API v3", "Gemini 3.5 Flash", "Python google-api-client"]
    },
    {
      id: 1,
      title: "2. Asset Collection",
      icon: Tv,
      desc: "Downloads targeted YouTube audio crops using 'yt-dlp'. Searches and fetches vertical high-definition watermark-free stock footage via Pexels portrait video APIs.",
      tech: ["yt-dlp", "Pexels Portrait API", "AWS S3 / GCP Storage"]
    },
    {
      id: 2,
      title: "3. Video Synthesis Engine",
      icon: Video,
      desc: "Executes programmatic FFMpeg overlays. Dims backgrounds for contrast, overlays scrolling synced lyrics, overlays watermark headers, and binds the high-fidelity audio crop.",
      tech: ["FFMpeg Programmatic Filters", "Whisper TTS (Sync)", "Python ffmpeg-python"]
    },
    {
      id: 3,
      title: "4. Caption & Reach Optimization",
      icon: Cpu,
      desc: "Gemini API reads lyrics and context to compose emotional, highly engaging regional captions, translations, and generates 15 high-reach regional hashtags.",
      tech: ["Gemini 3.5 Flash API", "JSON Schema Mode", "Meta Keyword Trees"]
    },
    {
      id: 4,
      title: "5. Safe Publisher Queue",
      icon: Share2,
      desc: "Schedules post assets. Uses the Meta Graph API Reels Container endpoints to upload, poll transcode status, and programmatically publish with zero third-party bot flags.",
      tech: ["Meta Graph API", "Instagram Content Publishing", "Cron / Celery"]
    }
  ];

  return (
    <div className="space-y-6" id="architecture-view">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-100/50 border border-slate-200/80 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-1 text-xs font-mono font-bold text-indigo-700 bg-indigo-100/60 rounded-full border border-indigo-200/50">
              ARCHITECTURE PROTOCOL
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
              The @the90s_breeze AI Content Pipeline
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              A robust, enterprise-grade architecture designed for safe, highly automated regional music content generation.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-600 shadow-sm">
            <Database className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span>State: Serverless Active</span>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Interactive Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive Steps Left Side */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
              Automated Operations Flow
            </h3>
            <div className="space-y-2">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = activeStep === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`w-full flex items-center gap-4 p-3.5 rounded-xl transition text-left border ${
                      isActive 
                        ? "bg-indigo-50 border-indigo-200 text-indigo-950 shadow-sm" 
                        : "bg-slate-50/50 border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold leading-none">{step.title}</p>
                      <p className="text-xs text-slate-400 mt-1.5 truncate">{step.tech.join(" • ")}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Step Detailed Architecture Specifications */}
        <div className="lg:col-span-7 flex flex-col justify-between p-6 bg-white border border-slate-200 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl">
                {React.createElement(steps[activeStep].icon, { className: "w-6 h-6 text-indigo-600" })}
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-indigo-600 font-semibold uppercase">
                  OPERATION SPECS
                </span>
                <h4 className="text-lg font-bold text-slate-900 leading-tight">
                  {steps[activeStep].title}
                </h4>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 border border-slate-100 rounded-xl font-sans">
              {steps[activeStep].desc}
            </p>

            <div className="space-y-3">
              <h5 className="text-xs font-mono text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-slate-400" />
                Integration Engine Stack
              </h5>
              <div className="flex flex-wrap gap-2">
                {steps[activeStep].tech.map((t, idx) => (
                  <span 
                    key={idx} 
                    className="px-2.5 py-1 text-xs font-mono text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Module Path: ./pipeline/step_{activeStep + 1}.py</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Verified Safe
            </span>
          </div>
        </div>
      </div>

      {/* Safety & Legality Warning Box */}
      <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-rose-100 border border-rose-200 rounded-xl text-rose-600 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-md font-bold text-slate-900 flex items-center gap-2">
              Crucial Policy & Fair-Use Standards
              <span className="px-2 py-0.5 text-[10px] font-mono text-rose-700 bg-rose-100 border border-rose-200 rounded-md uppercase font-bold">
                CRITICAL WARNING
              </span>
            </h4>
            <p className="text-xs text-rose-700 leading-relaxed font-medium">
              Instagram and YouTube algorithms strictly scan and punish content duplication. Automating the direct re-uploading of copyrighted videos, removing existing watermarks, or using direct unedited songs without licensing is a guaranteed path to account suspensions, shadowbans, and permanent bans.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-white border border-rose-100 rounded-xl shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-rose-600 font-mono text-xs uppercase font-bold">
              <AlertTriangle className="w-4 h-4" />
              Strictly Prohibited
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
              <li>Downloading other creators' reels and stripping watermarks.</li>
              <li>Re-uploading full music videos directly from YouTube.</li>
              <li>Using complete songs without editing or transforming.</li>
              <li>Over-tagging irrelevant trending hashtags to gain fake views.</li>
            </ul>
          </div>
          <div className="p-4 bg-white border border-emerald-100 rounded-xl shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 font-mono text-xs uppercase font-bold">
              <CheckCircle className="w-4 h-4" />
              Highly Recommended & Safe
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
              <li>Using <strong className="text-slate-800">watermark-free Portrait stock videos</strong> (e.g., misty roads, rainy cafes, nostalgic train views) from Pexels or custom generated AI backdrops.</li>
              <li>Limiting music cuts to high-impact hook segments of <strong className="text-slate-800">10-30 seconds</strong> (Fair Use safe limits).</li>
              <li>Adding unique visual value through <strong className="text-slate-800">scrolling lyrics translation overlays</strong> and custom retro VHS grain effects.</li>
              <li>Inviting audience engagement with conversational, nostalgic captions.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
