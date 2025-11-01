'use client';

import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface PreviewTestimonialsProps {
  testimonials: Testimonial[];
}

export default function PreviewTestimonials({ testimonials }: PreviewTestimonialsProps) {
  if (testimonials.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Quote className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>Henüz yorum yok</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {testimonials.map((testimonial) => (
        <div
          key={testimonial.id}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 relative"
        >
          {/* Quote Icon */}
          <Quote className="absolute top-3 right-3 w-8 h-8 text-purple-200" />

          {/* User Info */}
          <div className="flex items-center gap-3 mb-3">
            {testimonial.user.image ? (
              <Image
                src={testimonial.user.image}
                alt={testimonial.user.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {testimonial.user.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div>
              <div className="font-semibold text-sm text-gray-900">
                {testimonial.user.name}
              </div>
              <div className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(testimonial.createdAt), {
                  addSuffix: true,
                  locale: tr,
                })}
              </div>
            </div>
          </div>

          {/* Content */}
          <p className="text-sm text-gray-700 italic line-clamp-3 relative z-10">
            "{testimonial.content}"
          </p>
        </div>
      ))}
    </div>
  );
}
