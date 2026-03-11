'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CONTENT_TYPE_LABELS } from '@/lib/config';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, BookOpen, User, Calendar } from 'lucide-react';

// Tell Next.js not to statically generate this route
export const dynamic = 'force-dynamic';

export default function GuideDetailPage() {
  const params = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/content/${params.slug}`);
      if (res.ok) { const data = await res.json(); setPost(data.data); }
    } catch {} finally { setLoading(false); }
  }, [params.slug]);

  useEffect(() => { if (params.slug) fetchPost(); }, [params.slug, fetchPost]);

  if (loading) return <div className="container py-8 max-w-3xl"><div className="h-96 bg-muted animate-pulse rounded-lg" /></div>;

  if (!post) return (
    <div className="container py-16 text-center">
      <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">Beitrag nicht gefunden</h1>
      <Link href="/guides"><Button>Alle Guides</Button></Link>
    </div>
  );

  return (
    <div className="container py-8 max-w-3xl">
      <Link href="/guides" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Zurück zu Guides
      </Link>

      <article>
        <div className="mb-8">
          <Badge variant="outline" className="mb-3">
            {CONTENT_TYPE_LABELS[post.contentType as keyof typeof CONTENT_TYPE_LABELS] || post.contentType}
          </Badge>
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          {post.excerpt && <p className="text-lg text-muted-foreground mb-4">{post.excerpt}</p>}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {post.authorName && <span className="flex items-center gap-1"><User className="h-4 w-4" />{post.authorName}</span>}
            {post.publishedAt && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(post.publishedAt)}</span>}
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          {(() => {
            const lines = post.body.split('\n');
            const elements: React.ReactNode[] = [];
            let listItems: string[] = [];
            let numberedItems: string[] = [];

            const flushList = () => {
              if (listItems.length > 0) {
                elements.push(<ul key={`ul-${elements.length}`} className="list-disc pl-6 mb-4 space-y-1">{listItems.map((item, j) => <li key={j} className="text-muted-foreground">{item}</li>)}</ul>);
                listItems = [];
              }
              if (numberedItems.length > 0) {
                elements.push(<ol key={`ol-${elements.length}`} className="list-decimal pl-6 mb-4 space-y-1">{numberedItems.map((item, j) => <li key={j} className="text-muted-foreground">{item}</li>)}</ol>);
                numberedItems = [];
              }
            };

            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              if (line.startsWith('# ')) { flushList(); elements.push(<h1 key={i} className="text-2xl font-bold mt-8 mb-4">{line.slice(2)}</h1>); }
              else if (line.startsWith('## ')) { flushList(); elements.push(<h2 key={i} className="text-xl font-semibold mt-6 mb-3">{line.slice(3)}</h2>); }
              else if (line.startsWith('### ')) { flushList(); elements.push(<h3 key={i} className="text-lg font-semibold mt-4 mb-2">{line.slice(4)}</h3>); }
              else if (line.startsWith('- ')) { listItems.push(line.slice(2)); }
              else if (/^\d+\.\s/.test(line)) { numberedItems.push(line.replace(/^\d+\.\s/, '')); }
              else if (line.startsWith('**') && line.endsWith('**')) { flushList(); elements.push(<p key={i} className="font-semibold mb-2">{line.slice(2, -2)}</p>); }
              else if (line.trim() === '') { flushList(); }
              else { flushList(); elements.push(<p key={i} className="text-muted-foreground mb-3 leading-relaxed">{line}</p>); }
            }
            flushList();
            return elements;
          })()}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
