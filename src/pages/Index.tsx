import Hero from "@/components/Hero";
import GitHubRepos from "@/components/GitHubRepos";
import PCStats from "@/components/PCStats";
import BlogPreview from "@/components/BlogPreview";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <GitHubRepos />
      <PCStats />
      <BlogPreview />
    </div>
  );
};

export default Index;
