
import { Advertisement } from "@/types/music";
import { Card } from "@/components/ui/card";
import { Radio } from "lucide-react";

interface AdBannerProps {
  advertisement: Advertisement;
  timeRemaining: number;
}

const AdBanner = ({ advertisement, timeRemaining }: AdBannerProps) => {
  const progress = ((advertisement.duration - timeRemaining) / advertisement.duration) * 100;

  return (
    <Card className="backdrop-blur-3xl bg-gradient-to-r from-green-900/30 to-emerald-800/30 border border-green-500/30 shadow-[0_8px_32px_rgba(34,197,94,0.2)] p-4 rounded-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10 animate-pulse"></div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Radio className="h-6 w-6 text-green-400 animate-pulse" />
            <span className="text-green-400 font-bold text-sm uppercase tracking-wide">Advertisement</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{advertisement.title}</h3>
            <p className="text-white/80">{advertisement.brand}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-white/90 text-sm">
            {timeRemaining}s remaining
          </div>
          <div className="w-32 bg-white/20 rounded-full h-2 mt-1">
            <div 
              className="bg-green-400 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 rounded-lg overflow-hidden">
        <div className="w-full h-32 bg-gradient-to-r from-green-700/50 to-emerald-700/50 flex items-center justify-center border border-green-500/30">
          <div className="text-center text-white/80">
            <Radio className="h-8 w-8 mx-auto mb-2 text-green-400" />
            <p className="text-sm font-medium">{advertisement.title}</p>
            <p className="text-xs text-white/60">Advertisement Banner</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AdBanner;
