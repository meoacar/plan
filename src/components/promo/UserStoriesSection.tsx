"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { TrendingDown, Clock, Quote, Star, Award } from "lucide-react";

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
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-200/30 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-green-200/30 rounded-full blur-2xl"></div>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">
              🌟 Başarı Hikayeleri
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            Gerçek İnsanlar, Gerçek Sonuçlar
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
            Binlerce kişi hedeflerine ulaştı. Sıradaki sen olabilirsin! 💪
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <div
              key={story.id}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Featured Badge */}
              <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                <Star className="w-3 h-3 fill-current" />
                Öne Çıkan
              </div>

              {/* Before/After Images */}
              {story.beforeImage && story.afterImage && (
                <div className="relative">
                  <div className="grid grid-cols-2 gap-3 p-4">
                    <div className="relative aspect-square rounded-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                      <Image
                        src={story.beforeImage}
                        alt="Önce"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                        Önce
                      </div>
                    </div>
                    <div className="relative aspect-square rounded-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                      <Image
                        src={story.afterImage}
                        alt="Sonra"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-green-600/60 to-transparent"></div>
                      <div className="absolute bottom-3 left-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Sonra
                      </div>
                    </div>
                  </div>
                  {/* Divider Line */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-3/4 bg-white/50 rounded-full"></div>
                </div>
              )}

              <div className="p-6">
                {/* Name */}
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{story.name}</h3>

                {/* Stats */}
                <div className="flex flex-wrap gap-3 mb-5">
                  {story.beforeWeight && story.afterWeight && (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-200">
                      <TrendingDown className="w-5 h-5 text-green-600" />
                      <span className="font-bold text-green-700">
                        -{story.beforeWeight - story.afterWeight} kg
                      </span>
                    </div>
                  )}
                  {story.duration && (
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-700">{story.duration}</span>
                    </div>
                  )}
                </div>

                {/* Quote */}
                {story.quote && (
                  <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 mb-4 border border-green-100">
                    <Quote className="w-8 h-8 text-green-300 absolute -top-2 -left-2" />
                    <p className="text-gray-700 italic font-medium leading-relaxed pl-4">
                      "{story.quote}"
                    </p>
                  </div>
                )}

                {/* Story */}
                <p className="text-gray-600 leading-relaxed line-clamp-3">
                  {story.story}
                </p>

                {/* Read More Indicator */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Hikayeyi oku</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-green-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
