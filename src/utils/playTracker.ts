
import { PlayTracker } from "@/types/music";
import { advertisements } from "@/data/advertisements";

const STORAGE_KEY = "musicPlayerTracking";

export const getPlayTracker = (): PlayTracker => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const tracker = JSON.parse(stored) as PlayTracker;
      
      // Check if we need to reset (new day)
      const lastReset = new Date(tracker.lastReset);
      const now = new Date();
      const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceReset >= 24) {
        return resetPlayTracker();
      }
      
      return tracker;
    }
  } catch (error) {
    console.error("Error loading play tracker:", error);
  }
  
  return resetPlayTracker();
};

export const resetPlayTracker = (): PlayTracker => {
  const tracker: PlayTracker = {
    songPlays: {},
    adPlays: {},
    lastReset: new Date().toISOString()
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tracker));
  return tracker;
};

export const incrementSongPlay = (songId: string): void => {
  const tracker = getPlayTracker();
  tracker.songPlays[songId] = (tracker.songPlays[songId] || 0) + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tracker));
};

export const incrementAdPlay = (adId: string): void => {
  const tracker = getPlayTracker();
  tracker.adPlays[adId] = (tracker.adPlays[adId] || 0) + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tracker));
};

export const getAdPlayPriority = (adId: string): number => {
  const tracker = getPlayTracker();
  const ad = advertisements.find(a => a.id === adId);
  if (!ad) return 0;
  
  const currentPlays = tracker.adPlays[adId] || 0;
  const targetPlays = ad.magnitude;
  
  // Calculate how far behind we are from target
  const deficit = Math.max(0, targetPlays - currentPlays);
  
  // Higher deficit = higher priority
  return deficit;
};

export const shouldPlayAd = (): boolean => {
  // Play an ad roughly every 3-5 songs
  const random = Math.random();
  return random < 0.25; // 25% chance
};
