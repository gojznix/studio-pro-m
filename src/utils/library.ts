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

export const fetchSongs = async (): Promise<Song[]> => {
  const { data, error } = await (supabase.from("songs") as any).select("*");
  if (error) throw error;

  const rows: DbSong[] = data || [];
  return Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      title: row.title,
      artist: row.artist,
      rating: row.rating,
      duration: row.duration,
      audioUrl: await getSignedAudioUrl(row.audio_path),
    }))
  );
};

export const fetchAdvertisements = async (): Promise<Advertisement[]> => {
  const { data, error } = await (supabase.from("advertisements") as any)
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
