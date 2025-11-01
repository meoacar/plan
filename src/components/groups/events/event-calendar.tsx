'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { tr } from 'date-fns/locale';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  startDate: Date;
  eventType: string;
}

interface EventCalendarProps {
  events: Event[];
  groupSlug: string;
}

const eventTypeColors = {
  MEETUP: 'bg-blue-500',
  WEBINAR: 'bg-purple-500',
  WORKSHOP: 'bg-green-500',
  CHALLENGE: 'bg-yellow-500',
  OTHER: 'bg-gray-500',
};

export default function EventCalendar({ events, groupSlug }: EventCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = monthStart.getDay();
  // Adjust for Monday start (0 = Monday, 6 = Sunday)
  const startPadding = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(new Date(event.startDate), day));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-purple-600" />
          {format(currentMonth, 'MMMM yyyy', { locale: tr })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}

        {/* Empty cells for padding */}
        {Array.from({ length: startPadding }).map((_, index) => (
          <div key={`padding-${index}`} className="aspect-square" />
        ))}

        {/* Days */}
        {daysInMonth.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`aspect-square p-2 rounded-lg border-2 transition-colors ${
                isCurrentDay
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="h-full flex flex-col">
                <span
                  className={`text-sm font-semibold mb-1 ${
                    isCurrentDay ? 'text-purple-600' : 'text-gray-900'
                  }`}
                >
                  {format(day, 'd')}
                </span>
                <div className="flex-1 space-y-1 overflow-y-auto">
                  {dayEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={`/groups/${groupSlug}/events/${event.id}`}
                      className={`block w-full h-1.5 rounded-full ${
                        eventTypeColors[event.eventType as keyof typeof eventTypeColors] ||
                        eventTypeColors.OTHER
                      } hover:opacity-80 transition-opacity`}
                      title={event.title}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-3">Etkinlik Türleri</p>
        <div className="flex flex-wrap gap-4">
          {Object.entries(eventTypeColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${color}`} />
              <span className="text-sm text-gray-600">
                {type === 'MEETUP' && 'Buluşma'}
                {type === 'WEBINAR' && 'Webinar'}
                {type === 'WORKSHOP' && 'Atölye'}
                {type === 'CHALLENGE' && 'Challenge'}
                {type === 'OTHER' && 'Diğer'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
