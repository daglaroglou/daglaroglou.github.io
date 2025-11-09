import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, AlertCircle } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
      
      <div className="max-w-2xl w-full relative z-10 animate-fade-in">
        <div className="glass-card p-12 rounded-2xl text-center space-y-6 hover-lift">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="glass-card p-6 rounded-full inline-block">
              <AlertCircle className="w-16 h-16 text-primary" />
            </div>
          </div>
          
          {/* 404 Text */}
          <div className="space-y-2">
            <h1 className="text-8xl md:text-9xl font-bold glow-text">404</h1>
            <h2 className="text-2xl md:text-3xl font-semibold">Page Not Found</h2>
            <p className="text-muted-foreground text-lg">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Path info */}
          <div className="glass-card px-4 py-2 rounded-lg inline-block">
            <p className="text-sm text-muted-foreground font-mono">
              {location.pathname}
            </p>
          </div>

          {/* Return Home Button */}
          <div className="pt-4">
            <Link 
              to="/"
              className="glass-card px-8 py-4 rounded-full hover-lift transition-all hover:scale-105 inline-flex items-center gap-3 group"
            >
              <Home className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-semibold text-lg">Return Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
