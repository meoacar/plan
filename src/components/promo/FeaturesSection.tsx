"use client";

import { useEffect, useState } from "react";
import { Target, MessageSquare, Utensils, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
  link?: string;
}

const iconMap: Record<string, any> = {
  target: Target,
  message: MessageSquare,
  utensils: Utensils,
  zap: Zap,
};

export default function FeaturesSection() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/promo/features")
      .then((res) => res.json())
      .then((data) => {
        setFeatures(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Features fetch error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block animate-pulse bg-gray-200 h-12 w-96 rounded-lg mb-4"></div>
            <div className="inline-block animate-pulse bg-gray-100 h-6 w-64 rounded-lg"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-100 rounded-3xl p-8 animate-pulse h-64"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (features.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-100/50 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl -z-10"></div>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
              ✨ Özellikler
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Bu Sitede Neler Yapabilirsin?
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
            Her adımında seni destekleyen güçlü araçlar ve harika bir topluluk
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon] || Target;
            const CardContent = (
              <>
                {/* Hover Gradient Effect */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                  style={{ background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}40)` }}
                ></div>
                
                {/* Icon */}
                <div className="relative mb-6">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <Icon
                      className="w-10 h-10 transition-transform duration-500 group-hover:scale-110"
                      style={{ color: feature.color }}
                    />
                  </div>
                  {/* Decorative Circle */}
                  <div 
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"
                    style={{ backgroundColor: feature.color }}
                  ></div>
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-green-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {feature.description}
                </p>
                
                {/* Arrow Indicator */}
                <div className="flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0" style={{ color: feature.color }}>
                  <span>Keşfet</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </>
            );

            return feature.link ? (
              <Link
                key={feature.id}
                href={feature.link}
                className="group relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-gray-100 overflow-hidden block cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {CardContent}
              </Link>
            ) : (
              <div
                key={feature.id}
                className="group relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-gray-100 overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {CardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
