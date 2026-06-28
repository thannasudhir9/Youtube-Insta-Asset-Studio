export interface TrendItem {
  title: string;
  movie: string;
  year: number;
  singers: string;
  hookTime: string;
  mood: string;
  vibes: string;
  views: string;
}

export interface QueueItem {
  id: string;
  song: string;
  movie: string;
  language: string;
  caption: string;
  lyricsSnippet?: string;
  translatedLyrics?: string;
  bgUrl?: string;
  publishDate: string;
  status: "scheduled" | "published";
  platforms: ("instagram" | "youtube")[];
}

export interface AnalyticsData {
  language: string;
  followers: number;
  reelsCount: number;
  avgEngagement: number;
  sharesRate: number;
  growthPct: number;
}

export interface PerformanceOverTime {
  date: string;
  views: number;
  engagement: number;
}
