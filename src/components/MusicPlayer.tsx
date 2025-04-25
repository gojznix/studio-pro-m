import { useState } from "react";
import { Song } from "@/types/music";
import { songs } from "@/data/songs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MusicPlayer = () => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const getNextSong = (): Song => {
    const eligibleSongs = songs.filter(song => {
      const random = Math.random() * 100;
      
      if (song.rating >= 8.5) {
        return random <= 70; // 70% chance
      } else if (song.rating >= 5) {
        return random <= 25; // 25% chance
      }
      return false;
    });

    if (eligibleSongs.length === 0) {
      // If no songs were selected based on probability, pick a random song
      return songs[Math.floor(Math.random() * songs.length)];
    }

    return eligibleSongs[Math.floor(Math.random() * eligibleSongs.length)];
  };

  const handlePlay = () => {
    if (!currentSong) {
      const song = getNextSong();
      setCurrentSong(song);
      toast({
        title: "Now Playing",
        description: `${song.title} by ${song.artist}`,
      });
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleNext = () => {
    const song = getNextSong();
    setCurrentSong(song);
    toast({
      title: "Now Playing",
      description: `${song.title} by ${song.artist}`,
    });
  };

  return (
    <div 
      className="min-h-screen p-8 bg-cover bg-center"
      style={{
        backgroundImage: "url('https://source.unsplash.com/1600x900/?music,concert')",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/70 -z-10"></div>
      
      <div className="max-w-2xl mx-auto relative z-10">
        <Card className="backdrop-blur-2xl bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)] p-6 rounded-xl">
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                {currentSong ? currentSong.title : "Select a song"}
              </h2>
              <p className="text-white/90 text-lg">
                {currentSong ? currentSong.artist : "---"}
              </p>
              {currentSong && (
                <div className="flex items-center justify-center space-x-2 mt-1">
                  <span className="text-yellow-400 font-medium">Rating:</span>
                  <span className="text-white font-bold">{currentSong.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center space-x-6 py-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleNext()}
                className="rounded-full border-white/30 bg-white/15 hover:bg-white/30 backdrop-blur-lg shadow-md"
              >
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                variant="default"
                size="icon"
                onClick={isPlaying ? handlePause : handlePlay}
                className="rounded-full bg-green-500/90 hover:bg-green-600/90 backdrop-blur-lg h-14 w-14 shadow-lg border border-green-400/30"
              >
                {isPlaying ? (
                  <Pause className="h-7 w-7" />
                ) : (
                  <Play className="h-7 w-7 ml-1" />
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => handleNext()}
                className="rounded-full border-white/30 bg-white/15 hover:bg-white/30 backdrop-blur-lg shadow-md"
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            <div className="mt-8 space-y-2">
              <h3 className="text-xl font-semibold mb-4 text-white/90">Available Songs</h3>
              <div className="max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                {songs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-3 rounded-lg backdrop-blur-md bg-white/10 hover:bg-white/20 transition-colors border border-white/20 mb-2"
                  >
                    <div>
                      <p className="font-medium text-white">{song.title}</p>
                      <p className="text-sm text-white/80">{song.artist}</p>
                    </div>
                    <div className="flex items-center space-x-2 bg-black/30 px-3 py-1 rounded-full">
                      <span className="text-yellow-400 font-medium">Rating:</span>
                      <span className="text-white font-bold">{song.rating.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MusicPlayer;
