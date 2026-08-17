import { Song, Advertisement } from "@/types/music";
import { getAdPlayPriority, shouldPlayAd } from "./playTracker";

export const getNextSong = (songs: Song[]): Song => {
  const eligibleSongs = songs.filter((song) => {
    const random = Math.random() * 100;

    if (song.effectiveRating >= 8.5) {
      return random <= 70; // 70% chance for high-rated songs
    } else if (song.effectiveRating >= 5) {
      return random <= 25; // 25% chance for medium-rated songs
    }
    return false; // Low-rated songs handled by fallback
  });

  if (eligibleSongs.length === 0) {
    return songs[Math.floor(Math.random() * songs.length)];
  }

  return eligibleSongs[Math.floor(Math.random() * eligibleSongs.length)];
};

export const getNextAd = (advertisements: Advertisement[]): Advertisement | null => {
  if (!shouldPlayAd() || advertisements.length === 0) {
    return null;
  }

  const adPriorities = advertisements.map((ad) => ({
    ad,
    priority: getAdPlayPriority(ad.id, advertisements),
  }));

  adPriorities.sort((a, b) => b.priority - a.priority);

  const topAds = adPriorities.slice(0, 3);
  const weights = [50, 30, 20];

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

export const getNextContent = (songs: Song[], advertisements: Advertisement[]): Song | Advertisement => {
  const ad = getNextAd(advertisements);
  if (ad) {
    return ad;
  }
  return getNextSong(songs);
};
