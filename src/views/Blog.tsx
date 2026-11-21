"use client";
import Link from 'next/link';
import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User } from "lucide-react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { getAnonClientHeaders, isOpsDebugEnabled } from "@/lib/anonClientToken";
import { getOpsTelemetryFromInvoke } from "@/lib/opsTelemetry";
import { fallbackBlogArticles, BlogArticleItem } from "@/data/blogArticles";



const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [blogArticles, setBlogArticles] = useState<BlogArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opsRemaining, setOpsRemaining] = useState<number | null>(null);
  const [opsRetryAfterSeconds, setOpsRetryAfterSeconds] = useState<number | null>(null);
  const [opsPolicy, setOpsPolicy] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);

      const resp = await supabase.functions.invoke("get-public-blog-articles", {
        headers: { ...getAnonClientHeaders() },
        body: {},
      });

      const telemetry = getOpsTelemetryFromInvoke(resp, {
        action: "public_blog_list",
        bodyRemaining: resp?.data?.rateLimit?.remaining,
      } as any);
      setOpsRemaining(telemetry.remaining);
      setOpsRetryAfterSeconds(telemetry.retryAfterSeconds);
      setOpsPolicy(telemetry.policy);

      if (!alive) return;

      if (resp.error) {
        console.error("Failed to load blog articles:", resp.error);
        setError("Note: showing offline/local articles");
        setBlogArticles([...fallbackBlogArticles]);
      } else {
        const fetched = (resp.data?.articles ?? []) as BlogArticleItem[];
        
        // Merge fetched articles with fallbacks, avoiding duplicates by ID
        const combined = [...fetched];
        for (const fb of fallbackBlogArticles) {
          if (!combined.some(a => a.id === fb.id)) {
            combined.push(fb);
          }
        }
        
        // Sort by date descending
        combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setBlogArticles(combined);
      }

      setLoading(false);
    }

    void load();
    return () => {
      alive = false;
    };
  }, []);

  const categories = [
    { value: "all", label: "Alle Artikel" },
    { value: "breathwork", label: "Breathwork" },
    { value: "icebath", label: "Kälte & Eisbaden" },
    { value: "movement", label: "Bewegung & Yoga" },
    { value: "meditation", label: "Meditation & Klang" },
    { value: "holistic", label: "Ganzheitliche Gesundheit" },
    { value: "coaching", label: "Coaching & Sinn" },
  ];

  const filteredArticles = useMemo(() => {
    return selectedCategory === "all"
      ? blogArticles
      : blogArticles.filter((article) => article.category === selectedCategory);
  }, [blogArticles, selectedCategory]);

  const featuredArticle = blogArticles[0];

  return (
    <Layout>
      {/* Hero Section - Matching Landing Page Style */}
      <div className="relative min-h-[40vh] w-full flex flex-col bg-gradient-to-br from-primary via-primary/95 to-primary/80 dark:from-[#0a1628] dark:via-[#0a1628] dark:to-[#0f2137] overflow-hidden -mt-16 pt-16">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,205,172,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(22,177,195,0.1),transparent_50%)]" />
        
        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12">
          <div className="w-full max-w-3xl text-center flex flex-col items-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Wissen für dein <span className="bg-gradient-to-r from-[#00CDAC] to-[#16B1C3] bg-clip-text text-transparent">Wohlbefinden</span>
            </h1>
            
            <p className="text-sm sm:text-base lg:text-lg text-white/80 mb-10 leading-relaxed font-light max-w-xl mx-auto">
              Artikel über Breathwork, Eisbaden, Bewegung und ganzheitliche Praktiken.
            </p>

            {isOpsDebugEnabled() &&
              (opsRemaining !== null || opsRetryAfterSeconds !== null || opsPolicy !== null) && (
                <p className="-mt-6 mb-6 text-xs text-white/70">
                  Ops: remaining {opsRemaining ?? "—"}
                  {opsRetryAfterSeconds !== null
                    ? ` · retry-after ${opsRetryAfterSeconds}s`
                    : ""}
                  {opsPolicy ? ` · ${opsPolicy}` : ""}
                </p>
              )}

            {/* Category Filter Pills */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  variant="ghost"
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category.value 
                      ? "bg-gradient-to-r from-[#00CDAC] to-[#16B1C3] text-white font-bold shadow-lg" 
                      : "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/90 hover:bg-gray-200 dark:hover:bg-white/20 border border-gray-200 dark:border-white/20"
                  }`}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Article */}
      <section className="py-12 px-4 sm:px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="mb-6 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
              {error}
            </div>
          )}

          {loading && !featuredArticle ? (
            <div className="h-64 rounded-lg border border-border bg-card animate-pulse" />
          ) : featuredArticle ? (
            <Link href={`/blog/${featuredArticle.id}`} className="group block">
            <div className="relative rounded-lg overflow-hidden bg-card border border-border/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto overflow-hidden">
                  <img 
                    src={featuredArticle.image} 
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20" />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-center">
                  <Badge className="w-fit mb-4 bg-gradient-to-r from-[#00CDAC] to-[#16B1C3] text-white font-bold border-0">
                    Empfohlen
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 group-hover:text-[#00CDAC] transition-colors">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-muted-foreground mb-6 line-clamp-3">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#00CDAC]" />
                      <span>{featuredArticle.author}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#00CDAC]" />
                      <span>{new Date(featuredArticle.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#00CDAC]" />
                      <span>{featuredArticle.readTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </Link>
          ) : null}
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12 px-4 sm:px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Neueste <span className="bg-gradient-to-r from-[#00CDAC] to-[#16B1C3] bg-clip-text text-transparent">Artikel</span>
            </h2>
            <p className="text-muted-foreground">
              Praktische Einblicke und Anleitungen
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.slice(1).map((article) => (
              <Link 
                key={article.id} 
                href={`/blog/${article.id}`}
                className="group"
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card overflow-hidden">
                  <div className="relative h-44 overflow-hidden">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <Badge 
                        className="bg-gradient-to-r from-[#00CDAC] to-[#16B1C3] text-white font-bold border-0 text-xs capitalize shadow-lg"
                      >
                        {article.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold group-hover:text-[#00CDAC] transition-colors line-clamp-2">
                      {article.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <CardDescription className="line-clamp-2 text-sm">
                      {article.excerpt}
                    </CardDescription>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(article.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
