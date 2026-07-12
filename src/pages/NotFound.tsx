import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, AlertCircle, BookOpen, LayoutGrid } from "lucide-react";
import ParticlesBackground from "@/components/ParticlesBackground";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
      <ParticlesBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />

      <main className="max-w-2xl w-full relative z-10 animate-fade-in">
        <div className="glass-card p-10 sm:p-12 rounded-2xl text-center space-y-6 hover-lift">
          <div className="flex justify-center">
            <div className="glass-card p-6 rounded-full inline-block" aria-hidden>
              <AlertCircle className="w-16 h-16 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
              Error
            </p>
            <h1 className="text-8xl md:text-9xl font-bold glow-text leading-none">404</h1>
            <h2 className="text-2xl md:text-3xl font-semibold">Page not found</h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              That URL does not match any page here. You can go home or open one of the sections
              below.
            </p>
          </div>

          <div className="glass-card px-4 py-2 rounded-lg inline-block max-w-full overflow-hidden">
            <p className="text-sm text-muted-foreground font-mono truncate" title={location.pathname}>
              {location.pathname}
            </p>
          </div>

          <nav
            aria-label="Site pages"
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
            <Link
              to="/"
              className="glass-card px-5 py-3 rounded-full hover-lift transition-all inline-flex items-center gap-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Home className="w-4 h-4 shrink-0" aria-hidden />
              Home
            </Link>
            <Link
              to="/blog"
              className="glass-card px-5 py-3 rounded-full hover-lift transition-all inline-flex items-center gap-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <BookOpen className="w-4 h-4 shrink-0" aria-hidden />
              Blog
            </Link>
            <Link
              to="/portfolio"
              className="glass-card px-5 py-3 rounded-full hover-lift transition-all inline-flex items-center gap-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <LayoutGrid className="w-4 h-4 shrink-0" aria-hidden />
              Portfolio
            </Link>
          </nav>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
