'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatRelativeDate } from '@/lib/utils';
import { getIdToken } from '@/lib/auth/client';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';

export default function CandidateNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const token = await getIdToken();
      const res = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setNotifications(data.data || []); }
    } catch {} finally { setLoading(false); }
  };

  const markAllRead = async () => {
    try {
      const token = await getIdToken();
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications(notifications.map((n: any) => ({ ...n, isRead: true })));
    } catch {}
  };

  const markRead = async (id: string) => {
    try {
      const token = await getIdToken();
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      setNotifications(notifications.map((n: any) => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Benachrichtigungen</h1>
          <p className="text-muted-foreground">{unreadCount > 0 ? `${unreadCount} ungelesen` : 'Alle gelesen'}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="mr-2 h-4 w-4" />Alle als gelesen markieren
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : notifications.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Keine Benachrichtigungen</h3>
          <p className="text-muted-foreground">Du hast noch keine Benachrichtigungen erhalten.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-1">
          {notifications.map((notification: any) => (
            <div
              key={notification.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${!notification.isRead ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50'}`}
              onClick={() => { if (!notification.isRead) markRead(notification.id); }}
            >
              <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!notification.isRead ? 'bg-primary' : 'bg-transparent'}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'}`}>{notification.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatRelativeDate(notification.createdAt)}</p>
              </div>
              {notification.link && (
                <Link href={notification.link} className="shrink-0 mt-1">
                  <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
