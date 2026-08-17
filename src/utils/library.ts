import { supabase } from "@/integrations/supabase/client";
import { Song, Advertisement, DbSong, DbAdvertisement } from "@/types/music";

const SIGNED_URL_TTL = 60 * 60 * 24; // 24 hours

export const getSignedAudioUrl = async (path: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from("audio")
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (error) throw error;
  return data.signedUrl;
};

export const getSignedBannerUrl = async (path: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from("ad-banners")
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (error) throw error;
  return data.signedUrl;
};

export const MIN_VOTES_FOR_OVERRIDE = 3;

export interface SongRatingStat {
  song_id: string;
  avg_rating: number | string | null;
  vote_count: number;
}

export const fetchSongRatingStats = async (): Promise<Record<string, SongRatingStat>> => {
  const { data, error } = await ((supabase as any).from("song_rating_stats")).select("*");
  if (error) {
    console.error("Failed to load rating stats", error);
    return {};
  }
  const map: Record<string, SongRatingStat> = {};
  (data || []).forEach((row: SongRatingStat) => {
    map[row.song_id] = row;
  });
  return map;
};

export const computeEffectiveRating = (adminRating: number, stat?: SongRatingStat): number => {
  if (!stat || stat.vote_count < MIN_VOTES_FOR_OVERRIDE || stat.avg_rating == null) {
    return adminRating;
  }
  return Number(stat.avg_rating);
};

export const fetchSongs = async (): Promise<Song[]> => {
  const { data, error } = await ((supabase as any).from("songs")).select("*");
  if (error) throw error;

  const rows: DbSong[] = data || [];
  const stats = await fetchSongRatingStats();
  return Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      title: row.title,
      artist: row.artist,
      rating: row.rating,
      effectiveRating: computeEffectiveRating(row.rating, stats[row.id]),
      voteCount: stats[row.id]?.vote_count ?? 0,
      duration: row.duration,
      audioUrl: await getSignedAudioUrl(row.audio_path),
    }))
  );
};

export const fetchAdvertisements = async (): Promise<Advertisement[]> => {
  const { data, error } = await ((supabase as any).from("advertisements"))
    .select("*")
    .eq("active", true);
  if (error) throw error;

  const rows: DbAdvertisement[] = data || [];
  return Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      title: row.title,
      brand: row.brand,
      duration: row.duration,
      magnitude: row.magnitude,
      audioUrl: await getSignedAudioUrl(row.audio_path),
      bannerUrl: row.banner_path ? await getSignedBannerUrl(row.banner_path) : undefined,
    }))
  );
};
