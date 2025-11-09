import Hero from "@/components/Hero";
import GitHubRepos from "@/components/GitHubRepos";
import PCStats from "@/components/PCStats";
import BlogPreview from "@/components/BlogPreview";
import Donation from "@/components/Donation";
import ThemeToggle from "@/components/ThemeToggle";

const Index = () => {
  return (
    <div className="min-h-screen">
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      <Hero />
      <GitHubRepos />
      <PCStats />
      <BlogPreview />
      <Donation />
    </div>
  );
};

export default Index;
