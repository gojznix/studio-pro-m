
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)] p-6 rounded-xl">
          <div className="space-y-6">
            {/* Current Song Info */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                {currentSong ? currentSong.title : "Select a song"}
              </h2>
              <p className="text-white/80">
                {currentSong ? currentSong.artist : "---"}
              </p>
              {currentSong && (
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-yellow-400 font-medium">Rating:</span>
                  <span className="text-white">{currentSong.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleNext()}
                className="rounded-full border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-lg"
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                variant="default"
                size="icon"
                onClick={isPlaying ? handlePause : handlePlay}
                className="rounded-full bg-green-500/80 hover:bg-green-600/80 backdrop-blur-lg h-12 w-12 shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => handleNext()}
                className="rounded-full border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-lg"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Song List */}
            <div className="mt-8 space-y-2">
              <h3 className="text-lg font-semibold mb-4 text-white">Available Songs</h3>
              {songs.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-3 rounded-lg backdrop-blur-md bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                >
                  <div>
                    <p className="font-medium text-white">{song.title}</p>
                    <p className="text-sm text-white/70">{song.artist}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400 font-medium">Rating:</span>
                    <span className="text-white">{song.rating.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MusicPlayer;
