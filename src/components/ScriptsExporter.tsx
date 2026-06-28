import React, { useState } from "react";
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  Layers, 
  BookOpen, 
  ArrowRight,
  ShieldCheck,
  Settings
} from "lucide-react";
import { PYTHON_SCRIPTS } from "../scripts_data";

export default function ScriptsExporter() {
  const [activeTab, setActiveTab] = useState<keyof typeof PYTHON_SCRIPTS>("discovery");
  const [copied, setCopied] = useState<boolean>(false);

  const tabs: { id: keyof typeof PYTHON_SCRIPTS; label: string; file: string }[] = [
    { id: "requirements", label: "Requirements", file: "requirements.txt" },
    { id: "discovery", label: "Trend Scout", file: "yt_discovery.py" },
    { id: "generator", label: "Video Studio", file: "video_editor.py" },
    { id: "publish", label: "Instagram Publisher", file: "insta_publisher.py" }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(PYTHON_SCRIPTS[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([PYTHON_SCRIPTS[activeTab]], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = tabs.find(t => t.id === activeTab)?.file || "script.py";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="scripts-exporter">
      
      {/* Script Source Code Viewer (Grid Span 8) */}
      <div className="lg:col-span-8 flex flex-col justify-between p-5 bg-white border border-slate-200 shadow-sm rounded-2xl min-h-[500px]">
        <div>
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">
                  Python Automation Suite
                </h4>
                <p className="text-[10px] font-mono text-slate-400 font-semibold">
                  File: {tabs.find(t => t.id === activeTab)?.file}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                {copied ? "Copied" : "Copy Code"}
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                Download
              </button>
            </div>
          </div>

          {/* Script Selection Tabs */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold"
                    : "bg-slate-50 border-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                {tab.file}
              </button>
            ))}
          </div>

          {/* Code Area */}
          <div className="mt-4 p-4 bg-slate-950 border border-slate-900 rounded-xl overflow-x-auto">
            <pre className="font-mono text-xs text-slate-300 leading-relaxed max-h-96 overflow-y-auto custom-scrollbar whitespace-pre">
              <code>{PYTHON_SCRIPTS[activeTab]}</code>
            </pre>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>Licensing: OpenSource Fair Use</span>
          <span className="flex items-center gap-1 font-semibold text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Tested & Verified with FFMpeg 6.0
          </span>
        </div>
      </div>

      {/* Deployment & Setup Instructions (Grid Span 4) */}
      <div className="lg:col-span-4 space-y-4">
        <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
          <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            Local Setup Guide
          </h4>

          <div className="space-y-4 font-sans text-xs">
            
            <div className="space-y-1.5">
              <span className="font-mono font-bold text-indigo-600 block">Step 1: Install Requirements</span>
              <p className="text-slate-600 leading-relaxed">
                Set up a standard python virtual environment locally and run:
              </p>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[10px] text-slate-800">
                pip install -r requirements.txt
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="font-mono font-bold text-indigo-600 block">Step 2: Install FFMpeg System Link</span>
              <p className="text-slate-600 leading-relaxed">
                FFMpeg is required on your host machine to bind overlays and audio crops.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li>Mac: <code className="font-mono text-[10px] bg-slate-50 border border-slate-200/60 px-1 py-0.5 rounded text-slate-800">brew install ffmpeg</code></li>
                <li>Windows: Download from gyan.dev and append bin path to Environment variables.</li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <span className="font-mono font-bold text-indigo-600 block">Step 3: Environment Credentials</span>
              <p className="text-slate-600 leading-relaxed">
                Create a <code className="font-mono text-[10px] bg-slate-50 border border-slate-200/60 px-1 py-0.5 rounded text-slate-800">.env</code> file in your local script root directory:
              </p>
              <pre className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[10px] text-slate-800 overflow-x-auto">
{`YOUTUBE_API_KEY="AIzaSy..."
PEXELS_API_KEY="563492..."
INSTAGRAM_ACCOUNT_ID="1784..."
FACEBOOK_ACCESS_TOKEN="EAA..."`}
              </pre>
            </div>

            <div className="space-y-1.5">
              <span className="font-mono font-bold text-indigo-600 block">Step 4: Executing scripts</span>
              <p className="text-slate-600 leading-relaxed">
                Execute discovery and video compilation sequentially using the CLI:
              </p>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[10px] text-slate-800">
                python video_editor.py
              </div>
            </div>

          </div>
        </div>

        {/* Deploy to Cloud Banner */}
        <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-2.5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full" />
          <Settings className="w-5 h-5 text-indigo-600 animate-spin-slow" />
          <h5 className="text-xs font-bold text-slate-900">Need Serverless Cloud Scheduling?</h5>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Run these scripts in a Docker container inside <strong className="text-slate-800">AWS Fargate</strong> or <strong className="text-slate-800">GCP Cloud Run</strong> on a daily Cron scheduler for full 100% background automation.
          </p>
          <a 
            href="https://github.com/the90sbreeze" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] font-mono text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 pt-1"
          >
            Deploy specifications
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>

    </div>
  );
}
