import { Song, Advertisement } from "@/types/music";
import SongRating from "./SongRating";

interface PlayerHeaderProps {
  currentContent: Song | Advertisement | null;
  isAdvertisement: boolean;
}

const PlayerHeader = ({ currentContent, isAdvertisement }: PlayerHeaderProps) => {
  return (
    <div className="text-center space-y-3">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
        {currentContent ? currentContent.title : "Samodejno predvajanje glasbe"}
      </h2>
      <p className="text-white/90 text-lg">
        {currentContent
          ? isAdvertisement
            ? (currentContent as Advertisement).brand
            : (currentContent as Song).artist
          : "Nalaganje naslednje glasbe..."}
      </p>
      {currentContent && !isAdvertisement && (
        <div className="flex flex-col items-center gap-3 mt-1">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-yellow-400 font-medium">Ocena:</span>
            <span className="text-white font-bold">
              {(currentContent as Song).effectiveRating.toFixed(1)}
            </span>
            <span className="text-zinc-400 text-sm">
              ({(currentContent as Song).voteCount} glasov)
            </span>
          </div>
          <SongRating songId={currentContent.id} />
        </div>
      )}
    </div>
  );
};

export default PlayerHeader;
