"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Flame } from "lucide-react";

interface StreakCalendarProps {
  userId: string;
  activeDays: string[]; // YYYY-MM-DD formatında tarihler
  currentStreak: number;
  month?: Date;
}

export function StreakCalendar({
  activeDays,
  currentStreak,
  month: initialMonth,
}: StreakCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(
    initialMonth || new Date()
  );

  // Ay bilgileri
  const monthName = currentMonth.toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });

  // Ayın ilk ve son günü
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  );

  // Ayın ilk gününün haftanın hangi günü olduğu (0 = Pazar, 1 = Pazartesi, ...)
  const firstDayWeekday = firstDayOfMonth.getDay();

  // Takvim için günleri oluştur
  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];

    // Önceki aydan boş günler ekle (Pazartesi'den başlamak için)
    const startPadding = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    // Ayın günlerini ekle
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      days.push(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      );
    }

    return days;
  }, [currentMonth, firstDayWeekday, lastDayOfMonth]);

  // Bir günün aktif olup olmadığını kontrol et
  const isActiveDay = (date: Date | null): boolean => {
    if (!date) return false;
    const dateStr = date.toISOString().split("T")[0];
    return activeDays.includes(dateStr);
  };

  // Bugünün tarihi
  const today = new Date();
  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Gelecek tarih mi kontrol et
  const isFutureDate = (date: Date | null): boolean => {
    if (!date) return false;
    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    return dateOnly > todayOnly;
  };

  // Önceki aya git
  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  // Sonraki aya git
  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  // Bugüne git
  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Haftanın günleri
  const weekDays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  // Aktif gün sayısı (bu ay için)
  const activeDaysThisMonth = calendarDays.filter(
    (day) => day && isActiveDay(day)
  ).length;

  return (
    <Card className="overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="p-6">
        {/* Başlık */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">
              Aktivite Takvimi
            </h3>
          </div>
          <Button
            onClick={goToToday}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Bugün
          </Button>
        </div>

        {/* Ay Navigasyonu */}
        <div className="mb-4 flex items-center justify-between">
          <Button
            onClick={goToPreviousMonth}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h4 className="text-base font-semibold capitalize text-gray-900">
            {monthName}
          </h4>
          <Button
            onClick={goToNextMonth}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* İstatistikler */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs text-gray-600">Mevcut Streak</p>
                <p className="text-lg font-bold text-orange-600">
                  {currentStreak} gün
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-600">Bu Ay</p>
                <p className="text-lg font-bold text-blue-600">
                  {activeDaysThisMonth} gün
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Takvim Grid */}
        <div className="rounded-lg bg-white p-4 shadow-sm">
          {/* Haftanın Günleri */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-gray-600"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Günler */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              const active = isActiveDay(date);
              const today = isToday(date);
              const future = isFutureDate(date);

              return (
                <div
                  key={index}
                  className={`
                    relative flex aspect-square items-center justify-center rounded-lg text-sm font-medium transition-all
                    ${
                      !date
                        ? "cursor-default"
                        : future
                          ? "cursor-not-allowed bg-gray-50 text-gray-300"
                          : active
                            ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-md hover:shadow-lg"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }
                    ${today && !active ? "ring-2 ring-blue-400 ring-offset-1" : ""}
                  `}
                  title={
                    date
                      ? active
                        ? `${date.getDate()} - Aktif gün ✓`
                        : future
                          ? `${date.getDate()} - Gelecek`
                          : `${date.getDate()} - Aktif değil`
                      : ""
                  }
                >
                  {date && (
                    <>
                      <span className="relative z-10">{date.getDate()}</span>
                      {active && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-xl opacity-20">🔥</div>
                        </div>
                      )}
                      {today && (
                        <div className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-blue-500" />
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Açıklama */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-gradient-to-br from-green-400 to-emerald-500" />
            <span>Aktif Gün</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-gray-100" />
            <span>Aktif Değil</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-gray-50 ring-2 ring-blue-400 ring-offset-1" />
            <span>Bugün</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
