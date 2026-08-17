import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Music, Radio } from "lucide-react";

export const Header = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();

  return (
    <header className="flex items-center justify-between py-4 px-6 bg-zinc-900/80 border-b border-zinc-700/50">
      <Link to="/" className="text-white font-bold text-lg tracking-wide hover:text-green-400 transition-colors">
        STUDIO Pro M
      </Link>
      <nav className="flex items-center gap-4">
        {isAdmin && (
          <>
            <Link
              to="/admin/music"
              className="text-sm text-white/80 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Music className="h-4 w-4" />
              Glasba
            </Link>
            <Link
              to="/admin/ads"
              className="text-sm text-white/80 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Radio className="h-4 w-4" />
              Oglasi
            </Link>
          </>
        )}
        {user ? (
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="bg-transparent text-red-400 border-red-500/50 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Odjava
          </Button>
        ) : (
          <Link to="/auth">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent text-green-400 border-green-500/50 hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Prijava
            </Button>
          </Link>
        )}
      </nav>
    </header>
  );
};
