'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CONTENT_TYPE_LABELS, COUNTRIES } from '@/lib/config';
import { formatRelativeDate } from '@/lib/utils';
import { BarChart3, BookOpen, Search, TrendingUp } from 'lucide-react';

function formatCurrency(value: number | null | undefined) {
  if (!value) return 'n/a';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

export default function InsightsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [salaryInsights, setSalaryInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [contentRes, salaryRes] = await Promise.all([
          fetch('/api/content'),
          fetch(country ? `/api/salary?country=${encodeURIComponent(country)}` : '/api/salary'),
        ]);

        const contentData = await contentRes.json().catch(() => ({ data: [] }));
        const salaryData = await salaryRes.json().catch(() => ({ data: [] }));

        setPosts(contentData.data || []);
        setSalaryInsights(salaryData.data || []);
      } catch {
        setPosts([]);
        setSalaryInsights([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [country]);

  const filteredPosts = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return posts;
    return posts.filter((post) =>
      [post.title, post.excerpt, post.body, ...(post.tags || [])]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [posts, search]);

  const filteredSalaryInsights = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return salaryInsights;
    return salaryInsights.filter((item) =>
      [item.role, item.seniority, item.country]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [salaryInsights, search]);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Sales Market Insights</h1>
        <p className="text-muted-foreground">
          Gehaltsbenchmarks, Hiring Trends, Quota-Erwartungen und kuratierte Reports für Software Sales im DACH-Raum.
        </p>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suche nach Report, Rolle, OTE, Quota oder Hiring Trend..."
            className="pl-9"
          />
        </div>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="h-10 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">Alle Länder</option>
          {COUNTRIES.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, index) => <div key={index} className="h-40 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Reports & Articles</h2>
            </div>
            {filteredPosts.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  Noch keine veröffentlichten Reports für diese Suche.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredPosts.map((post) => (
                  <Link key={post.id} href={`/guides/${post.slug}`}>
                    <Card className="h-full transition-shadow hover:shadow-md">
                      <CardContent className="pt-6">
                        <Badge variant="outline" className="mb-3">
                          {CONTENT_TYPE_LABELS[post.contentType as keyof typeof CONTENT_TYPE_LABELS] || post.contentType}
                        </Badge>
                        <h3 className="mb-2 font-semibold line-clamp-2">{post.title}</h3>
                        <p className="mb-3 text-sm text-muted-foreground line-clamp-4">{post.excerpt || post.body}</p>
                        <div className="flex flex-wrap gap-2">
                          {(post.tags || []).slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">
                          {post.authorName || 'SalesCareerHub'} · {post.publishedAt ? formatRelativeDate(post.publishedAt) : 'Neu'}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Market Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Salary Datensätze</p>
                  <p className="mt-1 text-2xl font-semibold">{filteredSalaryInsights.length}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Veröffentlichte Reports</p>
                  <p className="mt-1 text-2xl font-semibold">{filteredPosts.length}</p>
                </div>
                <div className="rounded-lg border p-4 sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Abgedeckte Themen</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['OTE Range', 'Base Salary', 'Quota', 'Deal Size', 'Sales Cycle', 'Hiring Trends'].map((topic) => (
                      <Badge key={topic} variant="secondary">{topic}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Salary Table
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredSalaryInsights.slice(0, 8).map((item) => (
                  <div key={item.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{item.role}</p>
                        <p className="text-sm text-muted-foreground">{item.seniority} · {item.country}</p>
                      </div>
                      <Badge variant="outline">{item.year || 'Aktuell'}</Badge>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Base Salary</p>
                        <p className="font-medium">{formatCurrency(item.salaryBaseMin)} - {formatCurrency(item.salaryBaseMax)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">OTE Range</p>
                        <p className="font-medium">{formatCurrency(item.salaryOteMin)} - {formatCurrency(item.salaryOteMax)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Quota</p>
                        <p className="font-medium">{item.quotaAttainmentPct ? `${item.quotaAttainmentPct}% Attainment` : 'n/a'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Confidence</p>
                        <p className="font-medium">{item.confidenceScore ? `${item.confidenceScore}/100` : 'n/a'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </div>
      )}
    </div>
  );
}
