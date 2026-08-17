
export interface Song {
  id: string;
  title: string;
  artist: string;
  rating: number;
  effectiveRating: number;
  voteCount: number;
  audioUrl: string;
  duration: number; // seconds
}

export interface Advertisement {
  id: string;
  title: string;
  brand: string;
  duration: number; // in seconds
  magnitude: number; // target plays per 24 hours
  audioUrl: string;
  bannerUrl?: string;
}

export interface PlayTracker {
  songPlays: Record<string, number>;
  adPlays: Record<string, number>;
  lastReset: string; // ISO date string
}

export interface DbSong {
  id: string;
  title: string;
  artist: string;
  rating: number;
  audio_path: string;
  duration: number;
  uploaded_by?: string;
  created_at: string;
}

export interface DbAdvertisement {
  id: string;
  title: string;
  brand: string;
  audio_path: string;
  banner_path?: string;
  duration: number;
  magnitude: number;
  active: boolean;
  uploaded_by?: string;
  created_at: string;
}
