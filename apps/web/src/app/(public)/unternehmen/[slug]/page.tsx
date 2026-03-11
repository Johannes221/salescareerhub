'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { REMOTE_TYPE_LABELS, FUNDING_STAGE_LABELS, REVIEW_DIMENSION_LABELS } from '@/lib/config';
import { formatSalaryRange } from '@/lib/utils';
import {
  Building2, MapPin, Globe, Users, Shield, Star, Briefcase, ArrowLeft, ExternalLink,
} from 'lucide-react';

export default function CompanyDetailPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompany = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/companies/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setCompany(data.data);
        setJobs(data.jobs || []);
        setReviews(data.reviews || []);
      }
    } catch {} finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { if (slug) fetchCompany(); }, [slug, fetchCompany]);

  if (loading) return <div className="container py-8 max-w-4xl"><div className="h-96 bg-muted animate-pulse rounded-lg" /></div>;
  if (!company) return (
    <div className="container py-16 text-center">
      <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">Unternehmen nicht gefunden</h1>
      <Link href="/unternehmen"><Button>Alle Unternehmen</Button></Link>
    </div>
  );

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum: number, r: any) => sum + r.overallRating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="container py-8 max-w-4xl">
      <Link href="/unternehmen" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Zurück
      </Link>

      {/* Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{company.name}</h1>
                {company.isVerified && <Badge variant="outline"><Shield className="h-3 w-3 mr-1" />Verifiziert</Badge>}
                {company.isFeatured && <Badge>Featured</Badge>}
              </div>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                {company.industry && <span>{company.industry}</span>}
                {company.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{company.city}, {company.country}</span>}
                {company.employeeCount && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{company.employeeCount} Mitarbeiter</span>}
                {company.fundingStage && <span>{FUNDING_STAGE_LABELS[company.fundingStage as keyof typeof FUNDING_STAGE_LABELS]}</span>}
              </div>
              <div className="flex gap-2 mt-3">
                {company.website && <a href={company.website} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm"><Globe className="h-3 w-3 mr-1" />Website</Button></a>}
                {company.linkedinUrl && <a href={company.linkedinUrl} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm"><ExternalLink className="h-3 w-3 mr-1" />LinkedIn</Button></a>}
              </div>
            </div>
            {avgRating && (
              <div className="text-center shrink-0">
                <div className="flex items-center gap-1"><Star className="h-5 w-5 fill-yellow-400 text-yellow-400" /><span className="text-2xl font-bold">{avgRating}</span></div>
                <p className="text-xs text-muted-foreground">{reviews.length} Bewertungen</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {company.description && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Über das Unternehmen</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{company.description}</p></CardContent>
            </Card>
          )}

          {/* Jobs */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Offene Positionen ({jobs.length})</CardTitle></CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aktuell keine offenen Stellen.</p>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job: any) => (
                    <Link key={job.id} href={`/jobs/${job.slug}`} className="block">
                      <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div>
                          <p className="font-medium">{job.title}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{job.roleCategory}</Badge>
                            {job.remoteType && <Badge variant="outline" className="text-xs">{REMOTE_TYPE_LABELS[job.remoteType as keyof typeof REMOTE_TYPE_LABELS]}</Badge>}
                          </div>
                        </div>
                        {(job.salaryMin || job.oteMin) && (
                          <div className="text-right text-sm">
                            {job.oteMin && <p className="font-medium text-primary">OTE: {formatSalaryRange(job.oteMin, job.oteMax)}</p>}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews */}
          {reviews.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Bewertungen ({reviews.length})</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {reviews.map((review: any) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{review.overallRating.toFixed(1)}</span>
                        {review.roleAtCompany && <span className="text-xs text-muted-foreground">· {review.roleAtCompany}</span>}
                      </div>
                    </div>
                    {review.reviewText && <p className="text-sm text-muted-foreground mb-2">{review.reviewText}</p>}
                    {review.pros && <p className="text-sm"><span className="text-green-600 font-medium">Pro:</span> {review.pros}</p>}
                    {review.cons && <p className="text-sm"><span className="text-red-600 font-medium">Contra:</span> {review.cons}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {company.benefits && company.benefits.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Benefits</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {company.benefits.map((b: string) => <Badge key={b} variant="secondary">{b}</Badge>)}
                </div>
              </CardContent>
            </Card>
          )}
          {company.remotePolicy && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium mb-1">Remote Policy</p>
                <p className="text-sm text-muted-foreground">{REMOTE_TYPE_LABELS[company.remotePolicy as keyof typeof REMOTE_TYPE_LABELS] || company.remotePolicy}</p>
              </CardContent>
            </Card>
          )}
          {company.salesTeamSize && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium mb-1">Sales Team</p>
                <p className="text-sm text-muted-foreground">{company.salesTeamSize} Personen</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
