
import { useState, useEffect } from "react";
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
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gray-800 p-6 rounded-xl">
          <div className="space-y-6">
            {/* Current Song Info */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">
                {currentSong ? currentSong.title : "Select a song"}
              </h2>
              <p className="text-gray-400">
                {currentSong ? currentSong.artist : "---"}
              </p>
              {currentSong && (
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-yellow-400">Rating:</span>
                  <span>{currentSong.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleNext()}
                className="rounded-full"
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                variant="default"
                size="icon"
                onClick={isPlaying ? handlePause : handlePlay}
                className="rounded-full bg-green-500 hover:bg-green-600 h-12 w-12"
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
                className="rounded-full"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Song List */}
            <div className="mt-8 space-y-2">
              <h3 className="text-lg font-semibold mb-4">Available Songs</h3>
              {songs.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  <div>
                    <p className="font-medium">{song.title}</p>
                    <p className="text-sm text-gray-400">{song.artist}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400">Rating:</span>
                    <span>{song.rating.toFixed(1)}</span>
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
