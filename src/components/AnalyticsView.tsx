import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Legend 
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  Video, 
  Percent, 
  Sparkles, 
  Compass, 
  Lightbulb, 
  Zap,
  TrendingDown
} from "lucide-react";
import { AnalyticsData, PerformanceOverTime } from "../types";

export default function AnalyticsView() {
  // Mock performance metrics
  const languageData: AnalyticsData[] = [
    { language: "Telugu", followers: 15400, reelsCount: 24, avgEngagement: 14.8, sharesRate: 6.2, growthPct: 18.5 },
    { language: "Tamil", followers: 12100, reelsCount: 18, avgEngagement: 13.5, sharesRate: 5.8, growthPct: 12.2 },
    { language: "Hindi", followers: 24500, reelsCount: 31, avgEngagement: 11.2, sharesRate: 4.5, growthPct: 15.1 },
    { language: "Malayalam", followers: 8200, reelsCount: 12, avgEngagement: 16.1, sharesRate: 7.4, growthPct: 22.4 }
  ];

  const historicalGrowth: PerformanceOverTime[] = [
    { date: "Week 1", views: 42000, engagement: 4500 },
    { date: "Week 2", views: 68000, engagement: 7200 },
    { date: "Week 3", views: 95000, engagement: 10400 },
    { date: "Week 4", views: 142000, engagement: 15800 },
    { date: "Week 5", views: 185000, engagement: 21000 },
    { date: "Week 6", views: 250000, engagement: 32000 }
  ];

  const totalFollowers = languageData.reduce((acc, curr) => acc + curr.followers, 0);
  const totalReels = languageData.reduce((acc, curr) => acc + curr.reelsCount, 0);
  const avgEngagementRate = (languageData.reduce((acc, curr) => acc + curr.avgEngagement, 0) / 4).toFixed(1);

  return (
    <div className="space-y-6" id="analytics-view">
      
      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Followers Card */}
        <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl relative overflow-hidden flex items-center justify-between text-slate-900">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
              Cumulative Followers
            </span>
            <span className="text-2xl font-bold text-slate-900 block">
              {totalFollowers.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-emerald-600 flex items-center gap-0.5 font-bold">
              <TrendingUp className="w-3 h-3" />
              +16.8% monthly
            </span>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Views Card */}
        <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl relative overflow-hidden flex items-center justify-between text-slate-900">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
              Estimated Total Views
            </span>
            <span className="text-2xl font-bold text-slate-900 block">
              782.4K
            </span>
            <span className="text-[10px] font-mono text-emerald-600 flex items-center gap-0.5 font-bold">
              <TrendingUp className="w-3 h-3" />
              +24.5% monthly
            </span>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Reels Produced Card */}
        <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl relative overflow-hidden flex items-center justify-between text-slate-900">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
              Reels Compiled
            </span>
            <span className="text-2xl font-bold text-slate-900 block">
              {totalReels}
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Active across 4 languages
            </span>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <Video className="w-5 h-5" />
          </div>
        </div>

        {/* Engagement Rate Card */}
        <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl relative overflow-hidden flex items-center justify-between text-slate-900">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
              Avg Engagement Rate
            </span>
            <span className="text-2xl font-bold text-slate-900 block">
              {avgEngagementRate}%
            </span>
            <span className="text-[10px] font-mono text-indigo-600 font-bold">
              Industry average: ~4.2%
            </span>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <Percent className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Recharts Analytics Displays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Followers Views Trend Chart */}
        <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
          <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
            Weekly Growth Trend (Views vs Actions)
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: 8, fontSize: 11, color: '#1e293b' }} />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                <Line type="monotone" dataKey="views" name="Video Views" stroke="#4f46e5" strokeWidth={2.5} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="engagement" name="Saves & Shares" stroke="#ec4899" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional splitting metrics */}
        <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
          <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
            Engagement Split by Regional Language (%)
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={languageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="language" stroke="#94a3b8" style={{ fontSize: 11, fontWeight: 500 }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: 8, fontSize: 11, color: '#1e293b' }} />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                <Bar dataKey="avgEngagement" name="Avg Engagement %" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sharesRate" name="Direct Share Rate %" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* AI Intelligence recommendations box */}
      <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-3xl rounded-full" />
        
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono tracking-widest text-indigo-700 font-bold uppercase">
              PREDICTIVE RECOMMENDATIONS ENGINE
            </span>
            <h4 className="text-sm font-bold text-slate-900 leading-tight">
              Gemini AI-Driven Posting Recommendations
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          <div className="p-4 bg-white border border-indigo-200/50 shadow-sm rounded-xl space-y-1.5 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Zap className="w-4 h-4 text-indigo-600" />
                Leverage Malayalam Reels
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Malayalam melodies are experiencing a <strong className="text-slate-800">22.4%</strong> growth in saves. Direct shares are 20% higher than average. Focus on sad/reflective tracks on late night Thursdays.
              </p>
            </div>
            <span className="text-[9px] font-mono text-slate-400 uppercase mt-2">Vibe Match: Foggy Hills</span>
          </div>

          <div className="p-4 bg-white border border-indigo-200/50 shadow-sm rounded-xl space-y-1.5 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Lightbulb className="w-4 h-4 text-indigo-600" />
                Optimizing Subtitle Fonts
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Retention metrics double when original script lyrics are coupled with emotional English translations. Ensure the bottom watermark is set to 30% opacity to prevent viewport blocking.
              </p>
            </div>
            <span className="text-[9px] font-mono text-slate-400 uppercase mt-2">Render Engine: FFMpeg Drawtext</span>
          </div>

          <div className="p-4 bg-white border border-indigo-200/50 shadow-sm rounded-xl space-y-1.5 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Compass className="w-4 h-4 text-indigo-600" />
                The Wednesday Hindi Boost
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hindi romantic tracks from Udit Narayan perform best on Wednesdays between 6:00 PM and 8:00 PM IST. Use "Retro VHS TV Glow" backdrops to evoke maximum nostalgia.
              </p>
            </div>
            <span className="text-[9px] font-mono text-slate-400 uppercase mt-2">Nostalgia Trigger: Peak</span>
          </div>

        </div>
      </div>

    </div>
  );
}
