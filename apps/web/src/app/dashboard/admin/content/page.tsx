'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CONTENT_TYPES, CONTENT_TYPE_LABELS } from '@salescareerhub/config';
import { formatRelativeDate, slugify } from '@salescareerhub/utils';
import { getIdToken } from '@salescareerhub/auth/client';
import { BookOpen, Plus, Save, Edit, Eye, EyeOff, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminContentPage() {
  const { dbUser } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const token = await getIdToken();
      const res = await fetch('/api/admin/content', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setPosts(data.data || []); }
    } catch {} finally { setLoading(false); }
  };

  const savePost = async () => {
    if (!editing) return;
    setSaving(true); setMessage('');
    try {
      const token = await getIdToken();
      const method = editing.id ? 'PATCH' : 'POST';
      const res = await fetch('/api/admin/content', {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editing),
      });
      if (res.ok) { setMessage('Gespeichert'); setEditing(null); await fetchPosts(); }
    } catch {} finally { setSaving(false); }
  };

  const togglePublish = async (id: string, isPublished: boolean) => {
    try {
      const token = await getIdToken();
      await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, isPublished: !isPublished, publishedAt: !isPublished ? new Date() : null }),
      });
      await fetchPosts();
    } catch {}
  };

  if (dbUser?.role !== 'admin') return null;

  const newPost = () => setEditing({
    title: '', slug: '', contentType: 'guide', excerpt: '', body: '',
    authorName: 'SalesCareerHub Team', isPublished: false, tags: [],
  });

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Content verwalten</h1>
          <p className="text-muted-foreground">Karriere-Guides, Reports und Insights erstellen und verwalten</p>
        </div>
        <Button onClick={newPost}><Plus className="mr-2 h-4 w-4" />Neuer Beitrag</Button>
      </div>

      {message && <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 text-green-800 text-sm mb-4"><CheckCircle className="h-4 w-4" />{message}</div>}

      {/* Edit Form */}
      {editing && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-lg">{editing.id ? 'Beitrag bearbeiten' : 'Neuer Beitrag'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Titel *</label>
                <Input value={editing.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, title: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Typ</label>
                <select value={editing.contentType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditing({ ...editing, contentType: e.target.value })}
                  className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                  {CONTENT_TYPES.map((t) => <option key={t} value={t}>{CONTENT_TYPE_LABELS[t]}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input value={editing.slug} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, slug: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Zusammenfassung</label>
              <Input value={editing.excerpt || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, excerpt: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Inhalt (Markdown) *</label>
              <textarea value={editing.body || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditing({ ...editing, body: e.target.value })} rows={12}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Autor</label>
                <Input value={editing.authorName || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, authorName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cover Image URL</label>
                <Input value={editing.coverImageUrl || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, coverImageUrl: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={savePost} disabled={saving}>{saving ? 'Speichern...' : 'Speichern'}<Save className="ml-2 h-4 w-4" /></Button>
              <Button variant="outline" onClick={() => setEditing(null)}>Abbrechen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : posts.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Noch keine Beiträge</h3>
          <Button onClick={newPost}>Ersten Beitrag erstellen</Button>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {posts.map((post: any) => (
            <Card key={post.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium line-clamp-1">{post.title}</h3>
                      <Badge variant="outline" className="text-xs">{CONTENT_TYPE_LABELS[post.contentType as keyof typeof CONTENT_TYPE_LABELS]}</Badge>
                      {post.isPublished ? <Badge variant="success" className="text-xs">Live</Badge> : <Badge variant="secondary" className="text-xs">Entwurf</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{post.authorName} · {formatRelativeDate(post.createdAt)}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(post)}><Edit className="h-3 w-3" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => togglePublish(post.id, post.isPublished)}>
                      {post.isPublished ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
