import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar } from "lucide-react";

// Import blog posts (in a real app, this would come from an API or file system)
import blogPosts from "@/data/blog-posts.json";

const Blog = () => {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold mb-4 glow-text">Blog</h1>
        <p className="text-muted-foreground mb-12">
          Thoughts, tutorials, and experiences from my journey
        </p>

        <div className="space-y-6">
          {blogPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`}>
              <Card className="glass-card hover-lift p-6 transition-all duration-300">
                {post.image && (
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="w-4 h-4" />
                  <time>{new Date(post.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</time>
                </div>
                <h2 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
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
    </div>
  );
};

export default Blog;