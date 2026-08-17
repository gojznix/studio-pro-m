import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Music } from "lucide-react";
import { getAudioDuration, formatDuration } from "@/lib/audio";
import { DbSong } from "@/types/music";

const musicSchema = z.object({
  title: z.string().min(1, "Naslov je obvezen"),
  artist: z.string().min(1, "Izvajalec je obvezen"),
  rating: z.coerce.number().min(0).max(10),
  audioFile: z.instanceof(FileList).refine((files) => files.length === 1 && files[0].type === "audio/mpeg", {
    message: "Izberite eno MP3 datoteko",
  }),
});

type MusicForm = z.infer<typeof musicSchema>;

const AdminMusic = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [songs, setSongs] = useState<DbSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MusicForm>({
    resolver: zodResolver(musicSchema),
    defaultValues: { rating: 5 },
  });

  const fetchSongs = async () => {
    setLoading(true);
    const { data, error } = await ((supabase as any).from("songs")).select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Napaka pri nalaganju", description: error.message, variant: "destructive" });
    } else {
      setSongs(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSongs();
  }, [toast]);

  const onSubmit = async (values: MusicForm) => {
    if (!user) return;
    setSubmitting(true);
    try {
      const file = values.audioFile[0];
      const duration = await getAudioDuration(file);
      const path = `${user.id}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage.from("audio").upload(path, file, {
        contentType: "audio/mpeg",
      });
      if (uploadError) throw uploadError;

      const { error: insertError } = await ((supabase as any).from("songs")).insert({
        title: values.title,
        artist: values.artist,
        rating: values.rating,
        audio_path: path,
        duration,
        uploaded_by: user.id,
      });
      if (insertError) throw insertError;

      toast({ title: "Uspeh", description: "Skladba je bila dodana v knjižnico." });
      reset();
      fetchSongs();
    } catch (err: any) {
      toast({ title: "Napaka", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (song: DbSong) => {
    if (!confirm(`Ali res želite izbrisati ${song.title}?`)) return;
    try {
      const { error: storageError } = await supabase.storage.from("audio").remove([song.audio_path]);
      if (storageError) throw storageError;

      const { error: dbError } = await ((supabase as any).from("songs")).delete().eq("id", song.id);
      if (dbError) throw dbError;

      toast({ title: "Izbrisano", description: "Skladba je bila odstranjena." });
      fetchSongs();
    } catch (err: any) {
      toast({ title: "Napaka", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] p-6 bg-zinc-950 text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Music className="h-8 w-8 text-green-400" />
          <h1 className="text-2xl font-bold">Upravljanje glasbe</h1>
        </div>

        <Card className="bg-zinc-900 border-zinc-700/50">
          <CardHeader>
            <CardTitle>Nova skladba</CardTitle>
            <CardDescription className="text-white/60">Naložite MP3 datoteko in izpolnite podatke.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Naslov</Label>
                  <Input id="title" {...register("title")} className="bg-zinc-800 border-zinc-700" />
                  {errors.title && <p className="text-sm text-red-400">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artist">Izvajalec</Label>
                  <Input id="artist" {...register("artist")} className="bg-zinc-800 border-zinc-700" />
                  {errors.artist && <p className="text-sm text-red-400">{errors.artist.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Ocena (0-10)</Label>
                <Input id="rating" type="number" step="0.1" min={0} max={10} {...register("rating")} className="bg-zinc-800 border-zinc-700" />
                {errors.rating && <p className="text-sm text-red-400">{errors.rating.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="audioFile">MP3 datoteka</Label>
                <Input id="audioFile" type="file" accept="audio/mpeg" {...register("audioFile")} className="bg-zinc-800 border-zinc-700" />
                {errors.audioFile && <p className="text-sm text-red-400">{errors.audioFile.message}</p>}
              </div>
              <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700">
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Dodaj skladbo
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-700/50">
          <CardHeader>
            <CardTitle>Knjižnica skladb</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : songs.length === 0 ? (
              <p className="text-white/60">Ni še nobene skladbe.</p>
            ) : (
              <div className="space-y-3">
                {songs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
                  >
                    <div>
                      <p className="font-medium text-white">{song.title}</p>
                      <p className="text-sm text-white/70">{song.artist}</p>
                      <p className="text-xs text-white/50">
                        Ocena: {song.rating} | Trajanje: {formatDuration(song.duration)}
                      </p>
                    </div>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(song)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminMusic;
