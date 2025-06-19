
import { PlayTracker } from "@/types/music";
import { advertisements } from "@/data/advertisements";
import { songs } from "@/data/songs";

interface PlayerSidebarProps {
  isAutoPlaying: boolean;
  playTracker: PlayTracker;
}

const PlayerSidebar = ({ isAutoPlaying, playTracker }: PlayerSidebarProps) => {
  return (
    <div className="space-y-6">
      {/* Auto-Play Status */}
      <div className="text-center p-4 rounded-lg bg-white/10 border border-white/20">
        <h3 className="text-white/90 font-medium mb-2">Auto-Play Status</h3>
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${
          isAutoPlaying ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isAutoPlaying ? 'bg-green-400 animate-pulse' : 'bg-red-400'
          }`}></div>
          <span className="text-sm font-medium">
            {isAutoPlaying ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Advertisement Status */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white/90">Ad Performance</h3>
        <div className="max-h-[200px] overflow-y-auto pr-1 scrollbar-thin space-y-2">
          {advertisements.map((ad) => {
            const plays = playTracker.adPlays[ad.id] || 0;
            const progress = (plays / ad.magnitude) * 100;
            return (
              <div
                key={ad.id}
                className="p-3 rounded-lg backdrop-blur-md bg-white/10 border border-white/20"
              >
                <div className="flex justify-between items-center mb-1">
                  <p className="font-medium text-white text-sm">{ad.title}</p>
                  <span className="text-yellow-400 text-sm">{plays}/{ad.magnitude}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Songs */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white/90">Top Songs</h3>
        <div className="max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
          {songs
            .filter(song => song.rating >= 8.5)
            .slice(0, 10)
            .map((song) => {
              const plays = playTracker.songPlays[song.id] || 0;
              return (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-3 rounded-lg backdrop-blur-md bg-white/10 hover:bg-white/20 transition-colors border border-white/20 mb-2"
                >
                  <div>
                    <p className="font-medium text-white">{song.title}</p>
                    <p className="text-sm text-white/80">{song.artist}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-center">
                      <span className="text-white/60 text-xs block">Plays</span>
                      <span className="text-white font-bold">{plays}</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-black/30 px-2 py-1 rounded-full">
                      <span className="text-yellow-400 font-medium text-sm">★</span>
                      <span className="text-white font-bold text-sm">{song.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default PlayerSidebar;
