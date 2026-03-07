import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import ParticlesBackground from "@/components/ParticlesBackground";

import portfolioWebsites from "@/data/portfolio-websites.json";

const Portfolio = () => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 relative sm:pt-12">
      <ParticlesBackground />
      <div className="fixed top-6 left-6 z-50">
        <Link
          to="/"
          className="glass-card px-4 py-2 rounded-full hover-lift transition-all text-sm font-medium mb-6 sm:mb-0"
        >
          Home
        </Link>
      </div>
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      <div className="max-w-4xl mx-auto relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 glow-text">
          Portfolio
        </h1>
        <p className="text-muted-foreground mb-12">
          Websites and web projects I&apos;ve built
        </p>

        <div className="space-y-6">
          {portfolioWebsites.map((project) => (
            <Card
              key={project.id}
              className="glass-card hover-lift p-6 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {project.image && (
                  <div className="flex-shrink-0">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full md:w-64 h-40 object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2 text-foreground">
                        {project.title}
                      </h2>
                      <p className="text-sm text-muted-foreground mb-3">
                        {project.year}
                      </p>
                    </div>
                    {project.url && project.url !== "#" && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Visit
                      </a>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
