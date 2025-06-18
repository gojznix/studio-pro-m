
import { Song } from "@/types/music";
import { Advertisement } from "@/types/music";
import { songs } from "@/data/songs";
import { advertisements } from "@/data/advertisements";
import { getAdPlayPriority, shouldPlayAd } from "./playTracker";

export const getNextSong = (): Song => {
  const eligibleSongs = songs.filter(song => {
    const random = Math.random() * 100;
    
    if (song.rating >= 8.5) {
      return random <= 70; // 70% chance for high-rated songs
    } else if (song.rating >= 5) {
      return random <= 25; // 25% chance for medium-rated songs
    }
    return false; // Very low chance for low-rated songs (handled by fallback)
  });

  if (eligibleSongs.length === 0) {
    return songs[Math.floor(Math.random() * songs.length)];
  }

  return eligibleSongs[Math.floor(Math.random() * eligibleSongs.length)];
};

export const getNextAd = (): Advertisement | null => {
  if (!shouldPlayAd()) {
    return null;
  }

  // Calculate priorities for all ads
  const adPriorities = advertisements.map(ad => ({
    ad,
    priority: getAdPlayPriority(ad.id)
  }));

  // Sort by priority (highest first)
  adPriorities.sort((a, b) => b.priority - a.priority);

  // Select from top 3 highest priority ads with weighted randomness
  const topAds = adPriorities.slice(0, 3);
  const weights = [50, 30, 20]; // Higher priority ads get more weight
  
  const totalWeight = weights.reduce((sum, weight, index) => {
    return sum + (index < topAds.length ? weight : 0);
  }, 0);
  
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < topAds.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return topAds[i].ad;
    }
  }
  
  return topAds[0]?.ad || null;
};

export const getNextContent = (): Song | Advertisement => {
  const ad = getNextAd();
  if (ad) {
    return ad;
  }
  return getNextSong();
};
