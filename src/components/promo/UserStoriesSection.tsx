"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { TrendingDown, Clock, Quote } from "lucide-react";

interface UserStory {
  id: string;
  name: string;
  beforeImage?: string;
  afterImage?: string;
  beforeWeight?: number;
  afterWeight?: number;
  duration?: string;
  story: string;
  quote?: string;
}

export default function UserStoriesSection() {
  const [stories, setStories] = useState<UserStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/promo/stories?featured=true")
      .then((res) => res.json())
      .then((data) => {
        setStories(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Stories fetch error:", err);
        setLoading(false);
      });
  }, []);

  if (loading || stories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Plan Günlükleri
          </h2>
          <p className="text-gray-600 text-lg">
            Gerçek insanlardan, gerçek başarı hikayeleri
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story) => (
            <div
              key={story.id}
              className="bg-gradient-to-br from-green-50 to-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              {story.beforeImage && story.afterImage && (
                <div className="grid grid-cols-2 gap-2 p-4">
                  <div className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={story.beforeImage}
                      alt="Önce"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      Önce
                    </div>
                  </div>
                  <div className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={story.afterImage}
                      alt="Sonra"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs">
                      Sonra
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">{story.name}</h3>

                <div className="flex gap-4 mb-4">
                  {story.beforeWeight && story.afterWeight && (
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingDown className="w-4 h-4 text-green-600" />
                      <span className="font-semibold">
                        {story.beforeWeight - story.afterWeight} kg
                      </span>
                    </div>
                  )}
                  {story.duration && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{story.duration}</span>
                    </div>
                  )}
                </div>

                {story.quote && (
                  <div className="bg-white rounded-lg p-4 mb-4 relative">
                    <Quote className="w-6 h-6 text-green-200 absolute top-2 left-2" />
                    <p className="text-gray-700 italic pl-6">{story.quote}</p>
                  </div>
                )}

                <p className="text-gray-600 text-sm line-clamp-3">
                  {story.story}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
