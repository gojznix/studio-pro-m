
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
    <Card className="backdrop-blur-3xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 shadow-[0_8px_32px_rgba(255,193,7,0.2)] p-4 rounded-xl mb-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 animate-pulse"></div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Radio className="h-6 w-6 text-yellow-400 animate-pulse" />
            <span className="text-yellow-400 font-bold text-sm uppercase tracking-wide">Advertisement</span>
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
              className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 rounded-lg overflow-hidden">
        <img 
          src={advertisement.bannerUrl} 
          alt={advertisement.title}
          className="w-full h-32 object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://source.unsplash.com/800x200/?advertisement,banner";
          }}
        />
      </div>
    </Card>
  );
};

export default AdBanner;
