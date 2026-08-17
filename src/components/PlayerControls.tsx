import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
interface PlayerControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
}
const PlayerControls = ({
  isPlaying,
  onPlay,
  onPause,
  onNext
}: PlayerControlsProps) => {
  return <div className="flex items-center justify-center space-x-6 py-2">
      <Button variant="outline" size="icon" aria-label="Nazaj" onClick={onNext} className="rounded-full h-12 w-12 bg-zinc-900 border-2 border-zinc-600 hover:bg-zinc-800 hover:border-zinc-400 hover:scale-110 transition-all duration-200 shadow-lg shadow-black/50">
        <SkipBack className="h-5 w-5 text-white" />
      </Button>

      <Button variant="default" size="icon" aria-label={isPlaying ? "Pavza" : "Predvajaj"} onClick={isPlaying ? onPause : onPlay} className="rounded-full h-16 w-16 bg-gradient-to-br from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 border-2 border-green-300/50 shadow-xl shadow-green-500/30 hover:scale-110 active:scale-95 transition-all duration-200">
        {isPlaying ? <Pause className="h-8 w-8 text-white" /> : <Play className="h-8 w-8 ml-1 text-white" />}
      </Button>

      <Button variant="outline" size="icon" aria-label="Naprej" onClick={onNext} className="rounded-full h-12 w-12 bg-zinc-900 border-2 border-zinc-600 hover:bg-zinc-800 hover:border-zinc-400 hover:scale-110 transition-all duration-200 shadow-lg shadow-black/50">
        <SkipForward className="h-5 w-5 text-white" />
      </Button>
    </div>;
};
export default PlayerControls;