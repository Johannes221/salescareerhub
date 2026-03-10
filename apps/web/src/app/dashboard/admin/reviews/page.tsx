'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { REVIEW_DIMENSION_LABELS } from '@/lib/config';
import { formatRelativeDate } from '@/lib/utils';
import { getIdToken } from '@/lib/auth/client';
import { Star, CheckCircle, XCircle, Building2, MessageSquare } from 'lucide-react';

export default function AdminReviewsPage() {
  const { dbUser } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => { fetchReviews(); }, [filter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/admin/reviews?status=${filter}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setReviews(data.data || []); }
    } catch {} finally { setLoading(false); }
  };

  const updateReview = async (id: string, status: string) => {
    try {
      const token = await getIdToken();
      await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, status }),
      });
      await fetchReviews();
    } catch {}
  };

  if (dbUser?.role !== 'admin') return null;

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reviews moderieren</h1>
        <p className="text-muted-foreground">Unternehmensbewertungen prüfen und freischalten</p>
      </div>

      <div className="flex gap-2 mb-6">
        {['pending', 'approved', 'rejected'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium ${filter === s ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>
            {s === 'pending' ? 'Ausstehend' : s === 'approved' ? 'Genehmigt' : 'Abgelehnt'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : reviews.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Keine Reviews in dieser Kategorie</h3>
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <Card key={review.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{review.company?.name || 'Unternehmen'}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{review.overallRating?.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {review.roleAtCompany && `${review.roleAtCompany} · `}
                      {review.user?.email || 'Anonym'} · {formatRelativeDate(review.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {filter === 'pending' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => updateReview(review.id, 'approved')}>
                          <CheckCircle className="h-3 w-3 mr-1" />Freischalten
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateReview(review.id, 'rejected')}>
                          <XCircle className="h-3 w-3 mr-1" />Ablehnen
                        </Button>
                      </>
                    )}
                    <Badge variant={review.status === 'approved' ? 'success' : review.status === 'pending' ? 'warning' : 'destructive'}>
                      {review.status === 'approved' ? 'Genehmigt' : review.status === 'pending' ? 'Ausstehend' : 'Abgelehnt'}
                    </Badge>
                  </div>
                </div>

                {/* Dimension Scores */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {Object.entries(REVIEW_DIMENSION_LABELS).map(([key, label]) => (
                    <div key={key} className="text-center">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="font-semibold text-sm">{review[key]?.toFixed(1) || '-'}</p>
                    </div>
                  ))}
                </div>

                {review.reviewText && <p className="text-sm text-muted-foreground mb-2">{review.reviewText}</p>}
                <div className="flex gap-4 text-sm">
                  {review.pros && <p><span className="text-green-600 font-medium">Pro:</span> {review.pros}</p>}
                  {review.cons && <p><span className="text-red-600 font-medium">Contra:</span> {review.cons}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
