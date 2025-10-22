"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeightTracker from "./weight-tracker";
import CheckInForm from "./checkin-form";
import CheckInHistory from "./checkin-history";
import ProgressPhotos from "./progress-photos";
import MeasurementTracker from "./measurement-tracker";
import MoodTracker from "./mood-tracker";

interface AnalyticsDashboardProps {
  userId: string;
}

export default function AnalyticsDashboard({ }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-6 mb-8">
        <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
        <TabsTrigger value="checkin">Check-In</TabsTrigger>
        <TabsTrigger value="weight">Kilo</TabsTrigger>
        <TabsTrigger value="measurements">Ölçümler</TabsTrigger>
        <TabsTrigger value="photos">Fotoğraflar</TabsTrigger>
        <TabsTrigger value="mood">Ruh Hali</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <CheckInForm />
        <div className="grid gap-6 md:grid-cols-2">
          <WeightTracker compact />
          <MoodTracker compact />
        </div>
      </TabsContent>

      <TabsContent value="checkin">
        <div className="space-y-6">
          <CheckInForm />
          <CheckInHistory />
        </div>
      </TabsContent>

      <TabsContent value="weight">
        <WeightTracker />
      </TabsContent>

      <TabsContent value="measurements">
        <MeasurementTracker />
      </TabsContent>

      <TabsContent value="photos">
        <ProgressPhotos />
      </TabsContent>

      <TabsContent value="mood">
        <MoodTracker />
      </TabsContent>
    </Tabs>
  );
}
