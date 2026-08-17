import studioLogo from "@/assets/studio-logo.png";
import { Badge } from "@/components/ui/badge";

const Footer = () => {
  return (
    <footer className="mt-auto py-6 border-t border-zinc-700/50">
      <div className="flex flex-col items-center gap-4 text-center">
        <img 
          src={studioLogo} 
          alt="Studio Pro M" 
          className="h-10 object-contain opacity-70" 
        />
        <Badge className="bg-green-500/20 text-green-400 border border-green-500/50">
          v0.1.0
        </Badge>
        <p className="text-zinc-400 text-sm max-w-md">
          Program je v BETA verziji in je v fazi testiranja. Dostopen je samo na tej povezavi. URL ni nikjer drugje objavljen.
        </p>
      </div>
    </footer>
  );
};

export default Footer;