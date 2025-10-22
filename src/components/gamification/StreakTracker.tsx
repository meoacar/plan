"use client";

import { useEffect } from "react";

export function StreakTracker() {
  useEffect(() => {
    // Sayfa yüklendiğinde streak'i güncelle
    async function updateStreak() {
      try {
        await fetch("/api/gamification/streak", {
          method: "POST",
        });
      } catch (error) {
        console.error("Streak update failed:", error);
      }
    }

    updateStreak();
  }, []);

  return null; // Bu bileşen görünmez, sadece streak güncellemesi yapar
}
