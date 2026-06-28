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

export interface AnalyzedAsset {
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

export interface StoredAsset {
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
  isCurated?: boolean;
  data: AnalyzedAsset;
}
