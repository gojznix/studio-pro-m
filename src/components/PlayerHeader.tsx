
import { Song, Advertisement } from "@/types/music";

interface PlayerHeaderProps {
  currentContent: Song | Advertisement | null;
  isAdvertisement: boolean;
}

const PlayerHeader = ({ currentContent, isAdvertisement }: PlayerHeaderProps) => {
  return (
    <div className="text-center space-y-3">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
        {currentContent ? currentContent.title : "Auto-Playing Music"}
      </h2>
      <p className="text-white/90 text-lg">
        {currentContent ? 
          (isAdvertisement ? (currentContent as Advertisement).brand : (currentContent as Song).artist) 
          : "Loading next track..."}
      </p>
      {currentContent && !isAdvertisement && (
        <div className="flex items-center justify-center space-x-2 mt-1">
          <span className="text-yellow-400 font-medium">Rating:</span>
          <span className="text-white font-bold">{(currentContent as Song).rating.toFixed(1)}</span>
        </div>
      )}
    </div>
  );
};

export default PlayerHeader;
