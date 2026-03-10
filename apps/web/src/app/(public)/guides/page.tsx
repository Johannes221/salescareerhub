'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CONTENT_TYPE_LABELS } from '@/lib/config';
import { formatRelativeDate } from '@/lib/utils';
import { BookOpen } from 'lucide-react';

export default function GuidesPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content').then(r => r.json()).then(d => setPosts(d.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Karriere-Guides & Insights</h1>
        <p className="text-muted-foreground">Tipps, Reports und Insights für deine Software Sales Karriere</p>
      </div>
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Noch keine Guides verfügbar</h3>
          <p className="text-muted-foreground">Bald findest du hier Karriere-Guides und Insights.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post: any) => (
            <Link key={post.id} href={`/guides/${post.slug}`}>
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardContent className="pt-6">
                  <Badge variant="outline" className="mb-3">
                    {CONTENT_TYPE_LABELS[post.contentType as keyof typeof CONTENT_TYPE_LABELS] || post.contentType}
                  </Badge>
                  <h3 className="font-semibold mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{post.excerpt}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {post.authorName && <span>{post.authorName}</span>}
                    {post.publishedAt && <span>· {formatRelativeDate(post.publishedAt)}</span>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
