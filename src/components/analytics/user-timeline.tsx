'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface TimelineEvent {
  id: string;
  type: 'weight_log' | 'check_in' | 'plan' | 'badge' | 'goal' | 'photo';
  title: string;
  description: string;
  date: string;
  icon: string;
  color: string;
}

export function UserTimeline({ userId }: { userId: string }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/analytics/timeline?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return <div className="animate-pulse h-96 bg-gray-200 rounded-lg" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>⏳ Zaman Tüneli</CardTitle>
        <CardDescription>Yolculuğunuzun tüm hikayesi</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
          
          <div className="space-y-6">
            {events.map((event, index) => (
              <div key={event.id} className="relative flex gap-4">
                <div
                  className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl z-10"
                  style={{ backgroundColor: event.color }}
                >
                  {event.icon}
                </div>
                
                <div className="flex-1 pb-8">
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <span className="text-sm text-gray-500">
                        {format(new Date(event.date), 'dd MMM yyyy', { locale: tr })}
                      </span>
                    </div>
                    <p className="text-gray-600">{event.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
