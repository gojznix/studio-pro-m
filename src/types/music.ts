
export interface Song {
  id: string;
  title: string;
  artist: string;
  rating: number;
  audioUrl: string;
}

export interface Advertisement {
  id: string;
  title: string;
  brand: string;
  duration: number; // in seconds
  magnitude: number; // target plays per 24 hours
  audioUrl: string;
}

export interface PlayTracker {
  songPlays: Record<string, number>;
  adPlays: Record<string, number>;
  lastReset: string; // ISO date string
}
