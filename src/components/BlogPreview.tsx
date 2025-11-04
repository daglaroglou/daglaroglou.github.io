import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import blogPosts from "@/data/blog-posts.json";

const BlogPreview = () => {
  const recentPosts = blogPosts.slice(0, 3);

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-secondary/20 to-background">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 glow-text">
              Latest Posts
            </h2>
            <p className="text-muted-foreground">
              Thoughts and tutorials from my journey
            </p>
          </div>
          <Button variant="outline" asChild className="hover-lift">
            <Link to="/blog">
              View all
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`} className="block group">
              <Card className="glass-card hover-lift p-6 h-full transition-all duration-300">
                {post.image && (
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;