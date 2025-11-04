import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star, GitFork } from "lucide-react";

interface Repository {
  id: number;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  topics: string[];
}

const GitHubRepos = () => {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch("https://api.github.com/users/daglaroglou/repos?sort=updated&per_page=6");
        const data = await response.json();
        setRepos(data);
      } catch (error) {
        console.error("Error fetching GitHub repos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
    const interval = setInterval(fetchRepos, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section className="pt-8 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Loading projects...</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-8 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center glow-text">
          Featured Projects
        </h2>
        <p className="text-muted-foreground text-center mb-12">
          Recent projects from my GitHub
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repos.map((repo) => (
            <a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <Card className="glass-card hover-lift p-6 h-full transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {repo.name}
                  </h3>
                  <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {repo.description || "No description provided"}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>{repo.stargazers_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="w-4 h-4" />
                    <span>{repo.forks_count}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {repo.language && (
                    <Badge variant="secondary" className="text-xs">
                      {repo.language}
                    </Badge>
                  )}
                  {repo.topics?.slice(0, 2).map((topic) => (
                    <Badge key={topic} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GitHubRepos;