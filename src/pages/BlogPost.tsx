import { useParams, Link, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import blogPosts from "@/data/blog-posts.json";

const BlogPost = () => {
  const { id } = useParams();
  const post = blogPosts.find((p) => p.id === id);

  // Scroll to top when component mounts or when post changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [id]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <article className="max-w-3xl mx-auto">
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to blog
        </Link>

        {post.image && (
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover rounded-xl mb-8"
          />
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Calendar className="w-4 h-4" />
          <time>{new Date(post.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</time>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
          {post.title}
        </h1>

        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="prose prose-invert prose-neutral max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-6 mb-3" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
              p: ({node, ...props}) => <p className="text-foreground/90 leading-relaxed mb-4" {...props} />,
              a: ({node, ...props}) => <a className="text-foreground underline hover:text-foreground/80" {...props} />,
              code: ({node, inline, ...props}: any) => 
                inline ? (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props} />
                ) : (
                  <code className="block bg-muted p-4 rounded-lg overflow-x-auto my-4" {...props} />
                ),
              ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-border pl-4 italic my-4" {...props} />,
              img: ({node, ...props}) => <img className="rounded-lg my-4" {...props} />,
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;